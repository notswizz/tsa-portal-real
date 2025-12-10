export default function StaffApplicationForm({
  phone,
  location,
  dressSize,
  shoeSize,
  instagram,
  experience,
  saving,
  saveError,
  onChangePhone,
  onChangeLocation,
  onChangeDressSize,
  onChangeShoeSize,
  onChangeInstagram,
  onChangeExperience,
  onSubmit,
}) {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sa-slate">
        Complete your staff application
      </p>
      <p className="mt-3 text-sm text-sa-slate">
        Please share a few details so we can match you with the right
        opportunities. Once your application is saved, you&apos;ll see the full
        staff portal.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-5 space-y-4 text-sm text-sa-slate"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="phone"
              className="block text-xs font-medium uppercase tracking-[0.18em] text-sa-slate"
            >
              Phone number
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(event) => onChangePhone(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-sa-navy shadow-inner outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="location"
              className="block text-xs font-medium uppercase tracking-[0.18em] text-sa-slate"
            >
              Location
            </label>
            <select
              id="location"
              required
              value={location}
              onChange={(event) => onChangeLocation(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-sa-navy shadow-inner outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
            >
              <option value="">Select a city</option>
              <option value="ATL">Atlanta (ATL)</option>
              <option value="LA">Los Angeles (LA)</option>
              <option value="DAL">Dallas (DAL)</option>
              <option value="NYC">New York (NYC)</option>
              <option value="LV">Las Vegas (LV)</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="dressSize"
              className="block text-xs font-medium uppercase tracking-[0.18em] text-sa-slate"
            >
              Dress size
            </label>
            <input
              id="dressSize"
              type="text"
              required
              value={dressSize}
              onChange={(event) => onChangeDressSize(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-sa-navy shadow-inner outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="shoeSize"
              className="block text-xs font-medium uppercase tracking-[0.18em] text-sa-slate"
            >
              Shoe size
            </label>
            <input
              id="shoeSize"
              type="text"
              required
              value={shoeSize}
              onChange={(event) => onChangeShoeSize(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-sa-navy shadow-inner outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="instagram"
            className="block text-xs font-medium uppercase tracking-[0.18em] text-sa-slate"
          >
            Instagram handle
          </label>
          <input
            id="instagram"
            type="text"
            placeholder="@username"
            required
            value={instagram}
            onChange={(event) => onChangeInstagram(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-sa-navy shadow-inner outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="experience"
            className="block text-xs font-medium uppercase tracking-[0.18em] text-sa-slate"
          >
            Retail / wholesale experience
          </label>
          <textarea
            id="experience"
            required
            rows={4}
            value={experience}
            onChange={(event) => onChangeExperience(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-sa-navy shadow-inner outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
          />
          <p className="mt-1 text-[11px] text-sa-slate">
            Briefly tell us about your background working in retail, wholesale,
            events, or similar roles.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-sa-pink px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-[#ff0f80] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Saving application..." : "Save application"}
        </button>

        {saveError && (
          <p className="text-xs text-red-600" role="alert">
            {saveError}
          </p>
        )}
      </form>
    </>
  );
}
