// pb_material — Material Design 3 theme for Frappe v16
//
// v16 fix (2026-08-03): defer the override until Frappe has finished loading.
//
// Why: in v15, the original code at the top of this file ran synchronously
// and overrode frappe.ui.ThemeSwitcher successfully. In v16, app_include_js
// scripts run in <head> BEFORE Frappe's bundle defines the parent class —
// so `extends frappe.ui.ThemeSwitcher` failed (parent was undefined) and
// our override got overwritten when Frappe's bundle later defined the class.
//
// Fix: hook the override into Frappe's `app_ready` event (fired by
// desk.js after frappe.Application.startup() completes). By then
// frappe.ui.ThemeSwitcher exists and our subclass extends cleanly.
//
// This adds the Material theme card to the picker alongside
// Frappe Light / Timeless Night / Automatic. Click handler calls
// frappe.xcall('frappe.core.doctype.user.user.switch_theme', ...)
// which is overridden in hooks.py to accept "Material".

$(document).on("app_ready", function () {
	if (!frappe.ui || !frappe.ui.ThemeSwitcher) return;

	const Original = frappe.ui.ThemeSwitcher;
	frappe.ui.ThemeSwitcher = class CustomThemeSwitcher extends Original {
		fetch_themes() {
			return super.fetch_themes().then(() => {
				if (!this.themes.find((t) => t.name === "material")) {
					this.themes.push({
						name: "material",
						label: "Material by Processbricks",
						info: "Theme by Processbricks",
					});
				}
				return this.themes;
			});
		}
	};
});
