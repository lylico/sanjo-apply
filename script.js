const companyNameInput = document.getElementById('companyName');
const quantityInput = document.getElementById('quantity');
const startDateInput = document.getElementById('startDate');
const priceExcludingTaxSpan = document.getElementById('priceExcludingTax');
const priceIncludingTaxSpan = document.getElementById('priceIncludingTax');
const billingMonthSpan = document.getElementById('billingMonth');
const mailBodyOutput = document.getElementById('mailBodyOutput');

const UNIT_PRICE_EXCLUDING_TAX = 240000; // 1口あたりの税抜料金

// ページ読み込み時の初期処理
document.addEventListener('DOMContentLoaded', () => {
    // 今月の1日を開始日の初期値にする
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    // startDateInput.value = `${year}-${month}-01`;
    // 現在時刻が1日以降なら翌月1日を初期値とする
    if (today.getDate() > 1) {
        // 翌月1日
        today.setMonth(today.getMonth() + 1);
        const nextMonthYear = today.getFullYear();
        const nextMonth = (today.getMonth() + 1).toString().padStart(2, '0');
        startDateInput.value = `${nextMonthYear}-${nextMonth}-01`;
    } else {
        // 今月1日
        startDateInput.value = `${year}-${month}-01`;
    }

    calculatePrices(); // 初期表示時に料金を計算
});

// 入力変更時のイベントリスナー
quantityInput.addEventListener('input', calculatePrices);
startDateInput.addEventListener('change', calculatePrices);

/**
 * 口数と開始日に基づいて料金と請求月を計算し表示を更新する
 */
function calculatePrices() {
    let quantity = parseInt(quantityInput.value, 10);
    // 無効な値の場合のデフォルト設定
    if (isNaN(quantity) || quantity < 1) {
        quantity = 1;
        quantityInput.value = 1; // 入力欄も修正
    }

    const priceExcludingTax = quantity * UNIT_PRICE_EXCLUDING_TAX;
    // 消費税10%を加算し、小数点以下は切り上げ (日本の消費税計算に合わせる)
    const priceIncludingTax = Math.ceil(priceExcludingTax * 1.10); 

    priceExcludingTaxSpan.textContent = `${priceExcludingTax.toLocaleString()}円`;
    priceIncludingTaxSpan.textContent = `${priceIncludingTax.toLocaleString()}円`;

    const startDateValue = startDateInput.value;
    if (startDateValue) {
        const dateParts = startDateValue.split('-');
        billingMonthSpan.textContent = `${dateParts[0]}/${dateParts[1]}`;
    } else {
        billingMonthSpan.textContent = '';
    }
}

/**
 * フォームの入力内容からメール本文を生成し、表示エリアに設定する
 */
function generateMailBody() {
    const companyName = companyNameInput.value.trim(); // 前後の空白を削除
    const productName = document.getElementById('productName').value;
    const quantity = quantityInput.value;
    const priceExcludingTax = priceExcludingTaxSpan.textContent.replace('円', ''); // '円' を削除
    const priceIncludingTax = priceIncludingTaxSpan.textContent.replace('円', ''); // '円' を削除
    const billingMonth = billingMonthSpan.textContent;

    const startDateValue = startDateInput.value;
    let periodText = '';

    // 入力チェック
    if (!companyName) {
        alert("企業名を入力してください。");
        companyNameInput.focus(); // 企業名入力欄にフォーカス
        return;
    }
    if (!startDateValue) {
        alert("開始日を選択してください。");
        startDateInput.focus(); // 開始日入力欄にフォーカス
        return;
    }

    // 期間の計算
    const start = new Date(startDateValue);
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    end.setDate(end.getDate() - 1); // 開始日の前日までを終了日とする (例: 2025/01/01 -> 2025/12/31)

    // 日付フォーマット関数
    const formatDate = (date) => {
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        return `${y}/${m}/${d}`;
    };

    periodText = `${formatDate(start)} ～ ${formatDate(end)}`;

    // 最終的なメール本文の組み立て
    const mailBody = `----------------------------------------
・企業名　： ${companyName}
・品　名　： ${productName}
・口　数　： ${quantity}口 (${quantity * 5}名)
・期　間　： ${periodText}
・料　金　： ${priceExcludingTax} (税込${priceIncludingTax})
・ご請求月： ${billingMonth}
----------------------------------------

【年間特典】
・会員専用メルマガ配信
・各種イベントご招待
・オンラインセミナー アーカイブ先行配信、資料DL
・会員専用プレスリリース窓口の設置
・広告メニュー10%オフ
========================================`;

    mailBodyOutput.value = mailBody;
}

/**
 * 生成されたメール本文をクリップボードにコピーする
 */
function copyToClipboard() {
    if (!mailBodyOutput.value) {
        alert("生成するメール本文がありません。");
        return;
    }
    mailBodyOutput.select(); // テキストエリアの全内容を選択
    document.execCommand('copy'); // 選択した内容をコピー
    alert('生成されたテキストがクリップボードにコピーされました！');
}

/**
 * フォームの内容を初期状態にリセットする
 */
function resetForm() {
    companyNameInput.value = '';
    quantityInput.value = '1';
    
    // 開始日を初期値（今月または翌月の1日）に再設定
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    if (today.getDate() > 1) {
        today.setMonth(today.getMonth() + 1);
        const nextMonthYear = today.getFullYear();
        const nextMonth = (today.getMonth() + 1).toString().padStart(2, '0');
        startDateInput.value = `${nextMonthYear}-${nextMonth}-01`;
    } else {
        startDateInput.value = `${year}-${month}-01`;
    }

    mailBodyOutput.value = '';
    calculatePrices(); // 料金表示を更新
}