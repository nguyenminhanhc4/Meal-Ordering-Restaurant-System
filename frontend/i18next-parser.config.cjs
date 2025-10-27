module.exports = {
  // 📁 File nguồn cần quét
  input: ["src/**/*.{js,jsx,ts,tsx}"],

  // 📁 Nơi lưu file JSON sau khi quét
  output: "src/i18n/locales/$LOCALE/translation.json",

  // 🗣 Ngôn ngữ mặc định và ngôn ngữ hỗ trợ
  locales: ["en", "vi"],
  defaultLocale: "en",

  // ⚙️ Cấu hình parser
  createOldCatalogs: false, // không tạo folder _old
  keepRemoved: true, // giữ key cũ nếu code không còn dùng
  lexers: {
    js: ["JsxLexer"], // hỗ trợ JSX, TSX
    jsx: ["JsxLexer"],
    ts: ["JsxLexer"],
    tsx: ["JsxLexer"],
  },

  // 🔑 Cấu trúc key sinh ra
  keySeparator: ".",
  namespaceSeparator: ":",

  // 🧠 Tự thêm từ khóa nhận dạng trong code
  // Mặc định tool sẽ quét các function như t('...') hoặc i18n.t('...')
  defaultNamespace: "translation",

  verbose: true,
};
