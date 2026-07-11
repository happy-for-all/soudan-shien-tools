/* =========================================
   相談支援ノート｜script.js
   モニタリング・計画更新 期限管理ツール
   ※ 個人が特定できる情報は、すべてブラウザ内
     （localStorage）にのみ保存し、サーバーには
     一切送信・保存しません。
   ========================================= */

(function () {
  "use strict";

  const STORAGE_KEY = "soudan_monitoring_entries_v1";
  const URGENT_DAYS = 14;   // これ以下は赤（要提出間近）
  const WARNING_DAYS = 30;  // これ以下は黄（そろそろ準備）

  // ---------------------------------------------------------
  // 1. 日付ユーティリティ
  // ---------------------------------------------------------

  // 月を安全に加算する（月末の繰り上がりを防ぐ）
  function addMonths(date, months) {
    const d = new Date(date.getTime());
    const day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + months);
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(day, lastDay));
    return d;
  }

  function todayAtMidnight() {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }

  function formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}/${m}/${day}`;
  }

  function daysBetween(a, b) {
    const MS = 1000 * 60 * 60 * 24;
    return Math.round((b.getTime() - a.getTime()) / MS);
  }

  // 起算日と頻度（月数）から、「今日以降で直近の次回予定日」と
  // 「提出締切目安（次回予定月の前月末日）」を計算する
  function computeSchedule(startDateStr, freqMonths) {
    const start = new Date(startDateStr + "T00:00:00");
    const today = todayAtMidnight();

    let k = 0;
    let next = addMonths(start, freqMonths * k);
    // 起算日が未来の場合はそのまま、過去なら今日以降まで繰り上げる
    while (next < today) {
      k += 1;
      next = addMonths(start, freqMonths * k);
    }

    // 提出締切目安：次回予定月の「前月末日」
    const deadline = new Date(next.getFullYear(), next.getMonth(), 0);

    return { next, deadline };
  }

  // ---------------------------------------------------------
  // 2. 保存（localStorageのみ／サーバー送信なし）
  // ---------------------------------------------------------
  function loadEntries() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("読み込みに失敗しました", e);
      return [];
    }
  }

  function saveEntries(entries) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      return true;
    } catch (e) {
      console.error("保存に失敗しました", e);
      alert("保存に失敗しました。ブラウザの設定（プライベートモード等）をご確認ください。");
      return false;
    }
  }

  // ---------------------------------------------------------
  // 3. 描画
  // ---------------------------------------------------------
  function render() {
    const entries = loadEntries();
    const tbody = document.getElementById("entry-tbody");
    const emptyState = document.getElementById("empty-state");
    const tableWrap = document.getElementById("table-wrap");

    if (!entries.length) {
      tableWrap.style.display = "none";
      emptyState.style.display = "block";
      return;
    }
    tableWrap.style.display = "block";
    emptyState.style.display = "none";

    const today = todayAtMidnight();

    const rows = entries
      .map((entry) => {
        const { next, deadline } = computeSchedule(entry.startDate, entry.freqMonths);
        const daysLeft = daysBetween(today, deadline);
        return { entry, next, deadline, daysLeft };
      })
      .sort((a, b) => a.next - b.next);

    tbody.innerHTML = rows
      .map(({ entry, next, deadline, daysLeft }) => {
        let rowClass = "";
        let tag = `<span class="tag tag-ok">余裕あり</span>`;
        if (daysLeft <= URGENT_DAYS) {
          rowClass = "row-urgent";
          tag = `<span class="tag tag-urgent">提出間近</span>`;
        } else if (daysLeft <= WARNING_DAYS) {
          rowClass = "row-warning";
          tag = `<span class="tag tag-warning">準備を</span>`;
        }
        const daysLabel = daysLeft < 0 ? `${Math.abs(daysLeft)}日超過` : `残り${daysLeft}日`;

        return `
          <tr class="${rowClass}">
            <td>${escapeHtml(entry.name || "（名称未設定）")}</td>
            <td>${entry.freqMonths}ヶ月ごと</td>
            <td>${formatDate(next)}</td>
            <td>${formatDate(deadline)}</td>
            <td>${daysLabel}</td>
            <td>${tag}</td>
            <td><button class="delete-btn" data-id="${entry.id}">削除</button></td>
          </tr>`;
      })
      .join("");

    tbody.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!confirm("この項目を削除しますか？")) return;
        const id = btn.getAttribute("data-id");
        const next = loadEntries().filter((e) => e.id !== id);
        saveEntries(next);
        render();
      });
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ---------------------------------------------------------
  // 4. フォーム送信（追加）
  // ---------------------------------------------------------
  function handleSubmit(e) {
    e.preventDefault();
    const nameInput = document.getElementById("f-name");
    const startInput = document.getElementById("f-start");
    const freqInput = document.getElementById("f-freq");

    if (!startInput.value) {
      alert("起算日を入力してください。");
      return;
    }

    const entries = loadEntries();
    entries.push({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: nameInput.value.trim().slice(0, 40),
      startDate: startInput.value,
      freqMonths: Number(freqInput.value),
    });
    saveEntries(entries);

    nameInput.value = "";
    render();
  }

  // ---------------------------------------------------------
  // 5. CSV書き出し
  // ---------------------------------------------------------
  function exportCsv() {
    const entries = loadEntries();
    if (!entries.length) {
      alert("書き出せるデータがありません。");
      return;
    }
    const header = ["名称", "頻度(ヶ月)", "次回モニタリング予定日", "提出締切目安"];
    const rows = entries.map((entry) => {
      const { next, deadline } = computeSchedule(entry.startDate, entry.freqMonths);
      return [entry.name || "", entry.freqMonths, formatDate(next), formatDate(deadline)];
    });
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");

    // Excelでの文字化け対策としてBOMを付与
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monitoring_schedule_${formatDate(new Date()).replace(/\//g, "")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // ---------------------------------------------------------
  // 6. 初期化
  // ---------------------------------------------------------
  function init() {
    const form = document.getElementById("monitoring-form");
    const exportBtn = document.getElementById("export-csv");
    const printBtn = document.getElementById("print-list");

    if (form) form.addEventListener("submit", handleSubmit);
    if (exportBtn) exportBtn.addEventListener("click", exportCsv);
    if (printBtn) printBtn.addEventListener("click", () => window.print());

    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
