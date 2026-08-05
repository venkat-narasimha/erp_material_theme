// pb_material — v16 user dropdown hijack
// Purpose: Add "Change Theme Color" to the v16 user menu EVERYWHERE
//   (v16 redesigned the user UI — the user button now lives in the sidebar and
//   no longer opens a dropdown by default. Instead it routes to the user profile
//   form. This file hijacks the sidebar user button to show a Frappe menu
//   containing the same items as the desktop home page dropdown, plus
//   "Change Theme Color".)
//
// v15 behavior is unchanged — see material-theme-customizer.js for the legacy
// `#toolbar-user` append path.

(function () {
	"use strict";

	if (typeof window.frappe === "undefined") {
		// frappe not loaded yet — bail
		return;
	}

	const PB_USER_BTN_ATTR = "data-pb-patched";

	// ----------------------------------------------------------------
	// Build the v16 user menu items.
	// Mirrors frappe.desk.page.desktop.desktop.js::setup_avatar() so the
	// sidebar user menu matches the desktop home page user menu. The single
	// difference is the extra "Change Theme Color" item.
	// ----------------------------------------------------------------
	function get_user_menu_items() {
		const is_dark =
			document.documentElement.getAttribute("data-theme") === "dark";

		const items = [
			{
				icon: "edit",
				label: __("Edit Profile"),
				url: `/desk/user/${frappe.session.user}`,
			},
			{
				icon: is_dark ? "sun" : "moon",
				label: __("Toggle Theme"),
				onClick: function () {
					new frappe.ui.ThemeSwitcher().show();
				},
			},
			{
				icon: "palette",
				label: __("Change Theme Color"),
				onClick: function () {
					// material.theme.clear_demo is defined in
					// material-theme-customizer.js and opens the color picker.
					if (window.material && material.theme && material.theme.clear_demo) {
						material.theme.clear_demo();
					} else {
						frappe.msgprint({
							title: __("Theme customizer not loaded"),
							message: __(
								"PB Material color picker is unavailable. The site theme is set, but the color picker UI did not initialize. Please refresh the page."
							),
							indicator: "orange",
						});
					}
				},
			},
			{
				icon: "info",
				label: __("About"),
				onClick: function () {
					return frappe.ui.toolbar.show_about();
				},
			},
			{
				icon: "support",
				label: __("Frappe Support"),
				onClick: function () {
					window.open("https://support.frappe.io/help", "_blank");
				},
			},
			{
				icon: "rotate-ccw",
				label: __("Reset Desktop Layout"),
				onClick: function () {
					frappe.call({
						method:
							"frappe.desk.doctype.desktop_layout.desktop_layout.delete_layout",
						callback: function () {
							frappe.ui.toolbar.clear_cache();
						},
					});
				},
			},
			{
				icon: "log-out",
				label: __("Logout"),
				onClick: function () {
					frappe.app.logout();
				},
			},
		];

		return items;
	}

	// ----------------------------------------------------------------
	// Hijack the sidebar user button to show our menu instead of
	// routing to the user profile form.
	// ----------------------------------------------------------------
	function show_user_menu($trigger) {
		if (typeof frappe.ui.create_menu !== "function") {
			// Defensive — frappe menu not available
			frappe.set_route("Form", "User", frappe.session.user);
			return;
		}

		frappe.ui.create_menu({
			parent: $trigger.parent(),
			menu_items: get_user_menu_items(),
			open_on_left: !frappe.utils.is_rtl(),
		});
	}

	function patch_sidebar_user_button() {
		const $btn = $(".dropdown-navbar-user .sidebar-user-button");
		if ($btn.length === 0) return false; // not v16 sidebar (or not rendered yet)
		if ($btn.attr(PB_USER_BTN_ATTR) === "1") return true; // already patched

		$btn.attr(PB_USER_BTN_ATTR, "1");
		// Strip the inline onclick that calls frappe.ui.toolbar.route_to_user
		$btn.removeAttr("onclick");
		$btn.off("click").on("click", function (e) {
			e.preventDefault();
			e.stopPropagation();
			show_user_menu($(this));
		});
		return true;
	}

	// ----------------------------------------------------------------
	// Add "Change Theme Color" to the desktop home page dropdown.
	// This is a v16-only public extension point: add_menu_item().
	// (See frappe.desk.page.desktop.desktop.js)
	// ----------------------------------------------------------------
	function patch_desktop_home_dropdown() {
		if (!frappe.pages || !frappe.pages["desktop"]) return false;
		const page = frappe.pages["desktop"].desktop_page;
		if (!page || typeof page.add_menu_item !== "function") return false;

		const already = (page.desktop_menu_items || []).some(
			(i) => i.label === "Change Theme Color"
		);
		if (already) return true;

		page.add_menu_item({
			icon: "palette",
			label: __("Change Theme Color"),
			onClick: function () {
				if (window.material && material.theme && material.theme.clear_demo) {
					material.theme.clear_demo();
				}
			},
		});
		return true;
	}

	// ----------------------------------------------------------------
	// Run all patches. Idempotent — safe to call multiple times.
	// ----------------------------------------------------------------
	function run_patches() {
		patch_sidebar_user_button();
		patch_desktop_home_dropdown();
	}

	// Fire when the desk app is ready.
	$(document).on("app_ready", function () {
		run_patches();
	});

	// Re-fire on SPA route changes. Frappe does not fully reload pages
	// when navigating between forms, but it can re-render the sidebar
	// user button. The PB_USER_BTN_ATTR check makes this safe.
	if (frappe.router && typeof frappe.router.on === "function") {
		frappe.router.on("change", function () {
			// Small delay so the new route's DOM is in place.
			setTimeout(run_patches, 100);
		});
	}
})();
