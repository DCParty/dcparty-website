export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-50">
          聯絡與合作
        </h1>
        <p className="text-sm sm:text-base text-slate-300">
          如果你對合作、報價或專案有任何想法，可以在這裡放上你的聯絡方式，
          例如 Email、Instagram、Behance 或表單連結。未來也可以接入真正的表單系統。
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-6 text-sm text-slate-200">
        <p>📩 範例 Email：yourname@example.com</p>
        <p className="mt-2">📷 Instagram：@yourcreativehandle</p>
      </div>
    </div>
  );
}
