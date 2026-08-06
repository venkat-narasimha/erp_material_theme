// pb_material — top-right palette icon + sidebar header menu item (v16)
//
// PURPOSE
//   Surfaces the "Change Theme Color" action everywhere in v16.
//   Click → opens the PB Material color picker (material.theme.clear_demo).
//
// UX MAP
//   Page type        Where it lives
//   ─────────────    ─────────────────────────────────────────────
//   Home (desktop)   Top-right icon (prepended to .desktop-avatar)
//   Workspace        Sidebar header dropdown (the v15-style menu with
//                    Session Defaults, Toggle Theme, Logout etc.)
//   Form / List      Top-right icon (.navbar-right) where present
//
// WHY NOT THE DROPDOWN-HIJACK FROM EARLIER TODAY
//   First attempts monkey-patched v16's SidebarHeader.dropdown_items
//   and DesktopPage.desktop_menu_items — both internal APIs that
//   broke on the smallest change (e.g., a header.attr() call treating
//   a class instance as a jQuery object). This version uses:
//   - stable CSS class names (.navbar-right, .desktop-avatar)
//   - public class instance properties/methods of SidebarHeader
//     (the menu dropdown_items array, populate_dropdown_menu())
//   These are stable enough to ride through v16 minor versions
//   without breakage; if Frappe refactors the sidebar header class
//   entirely, the patch is a one-line update.
//
// TIMING
//   app_ready fires when the desk is ready, but workspace pages
//   render the top navbar ASYNCHRONOUSLY after app_ready. The
//   retry_window() polls for ~2s after app_ready, idempotently
//   adding the icon as soon as the navbar appears. Subsequent
//   navigations are handled by the route-change listener.
//
// LOADING ORDER
//   This file must load AFTER material-theme-customizer.js (which
//   defines material.theme.clear_demo). hooks.py order guarantees this.

(function () {
	"use strict";

	if (typeof window.frappe === "undefined") {
		return;
	}

	const BTN_CLASS = "pb-material-theme-color-btn";
	const TOOLTIP = __("Change Theme Color");
	const CLICK_NS = ".pb-material-theme-color";
	const SIDEBAR_HEADER_ITEM_NAME = "pb-material-change-theme-color";
	let _clickBound = false;
	let _retryHandle = null;

	// ----------------------------------------------------------------
	// Icon — use Frappe's standard SVG icon renderer if available.
	// ----------------------------------------------------------------
	function get_icon_svg() {
		if (typeof frappe.utils.icon === "function") {
			return frappe.utils.icon("palette", "md");
		}
		return (
			'<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" ' +
			'aria-hidden="true">' +
			'<path d="M8 1a7 7 0 1 0 0 14 .5.5 0 0 0 .5-.5v-1a.5.5 0 0 1 .5-.5h1.5a2.5 2.5 0 0 0 0-5H10a.5.5 0 0 1-.5-.5v-1A.5.5 0 0 0 9 1H8z"/>' +
			"</svg>"
		);
	}

	// ----------------------------------------------------------------
	// Open the color picker (defined in material-theme-customizer.js).
	// ----------------------------------------------------------------
	function open_picker() {
		if (
			window.material &&
			material.theme &&
			typeof material.theme.clear_demo === "function"
		) {
			material.theme.clear_demo();
		} else {
			console.warn(
				"[pb-material] color picker not loaded. Ensure " +
					"material-theme-customizer.js loads before " +
					"theme-customizer-v16.js."
			);
		}
	}

	// ----------------------------------------------------------------
	// Build the top-right icon button HTML.
	// ----------------------------------------------------------------
	function make_icon_button_html() {
		return (
			'<a class="' +
			BTN_CLASS +
			' btn btn-reset"' +
			' title="' +
			TOOLTIP +
			'"' +
			' aria-label="' +
			TOOLTIP +
			'"' +
			' href="#"' +
			' role="button">' +
			get_icon_svg() +
			"</a>"
		);
	}

	// ----------------------------------------------------------------
	// Path A: top navbar (form, list pages where .navbar-right exists)
	// ----------------------------------------------------------------
	function patch_top_navbar() {
		const $nav = $(".navbar-right");
		if (
			$nav.length &&
			!$nav.find("." + BTN_CLASS).length
		) {
			$nav.append(
				'<li class="nav-item pb-material-theme-color-wrapper">' +
					make_icon_button_html() +
					"</li>"
			);
			return true;
		}
		return false;
	}

	// ----------------------------------------------------------------
	// Path B: home page (where top navbar is hidden, .desktop-avatar
	// is the right-side user element)
	// ----------------------------------------------------------------
	function patch_home_page() {
		const $avatar = $(".desktop-avatar");
		if (
			$avatar.length &&
			!$avatar.parent().find("." + BTN_CLASS).length
		) {
			$avatar.before(make_icon_button_html());
			return true;
		}
		return false;
	}

	// ----------------------------------------------------------------
	// Path C: workspace pages (no top navbar, but the sidebar header
	// dropdown hosts the v15-style user menu — Desktop, Workspaces,
	// Session Defaults, Toggle Theme, Logout). We add a "Change
	// Theme Color" item to that dropdown, inserted just before the
	// Logout entry (matching v15 placement).
	//
	// Returns true if a patch was applied (or already applied),
	// false if the sidebar header isn't available yet.
	// ----------------------------------------------------------------
	function patch_sidebar_header_dropdown() {
		const sidebar = frappe.app && frappe.app.sidebar;
		const header = sidebar && sidebar.sidebar_header;
		if (
			!header ||
			!Array.isArray(header.dropdown_items) ||
			typeof header.add_app_item !== "function" ||
			!header.dropdown_menu
		) {
			return false;
		}

		// Idempotency: check the source-of-truth array, not a jQuery attr.
		const already_registered = header.dropdown_items.some(
			(d) => d && d.name === SIDEBAR_HEADER_ITEM_NAME
		);

		if (!already_registered) {
			const item = {
				name: SIDEBAR_HEADER_ITEM_NAME,
				label: __("Change Theme Color"),
				icon: "palette",
				is_standard: 1,
				onClick: function () {
					open_picker();
				},
			};

			// Insert just before the "logout" entry so it sits at the
			// bottom of the user section (like v15).
			const logout_idx = header.dropdown_items.findIndex(
				(d) => d && d.name === "logout"
			);
			if (logout_idx >= 0) {
				header.dropdown_items.splice(logout_idx, 0, item);
			} else {
				header.dropdown_items.push(item);
			}
		}

		// Re-render the menu DOM. populate_dropdown_menu() appends to
		// this.dropdown_menu without clearing; we empty first to avoid
		// duplicates. Then re-bind click handlers.
		if (typeof header.dropdown_menu.empty === "function") {
			header.dropdown_menu.empty();
		}
		if (typeof header.populate_dropdown_menu === "function") {
			header.populate_dropdown_menu();
		}
		if (typeof header.setup_select_options === "function") {
			header.setup_select_options();
		}
		return true;
	}

	// ----------------------------------------------------------------
	// Click handler (delegated on document — survives re-renders).
	// ----------------------------------------------------------------
	function bind_click_once() {
		if (_clickBound) return;
		$(document).on(
			"click" + CLICK_NS,
			"." + BTN_CLASS,
			function (e) {
				e.preventDefault();
				open_picker();
			}
		);
		// Sidebar header items are bound by setup_select_options() above
		// (the menu re-render calls it). No extra binding needed here.
		_clickBound = true;
	}

	// ----------------------------------------------------------------
	// Run all patches.
	// ----------------------------------------------------------------
	function patch() {
		patch_top_navbar();
		patch_home_page();
		patch_sidebar_header_dropdown();
		bind_click_once();
	}

	// ----------------------------------------------------------------
	// Retry window: app_ready fires before the workspace navbar is
	// rendered. Poll for ~2s to catch late-rendering elements.
	// Idempotent — once any path is satisfied, further calls no-op.
	// ----------------------------------------------------------------
	function start_retry_window(duration_ms) {
		if (_retryHandle) return;
		const start = Date.now();
		_retryHandle = setInterval(function () {
			patch();
			const elapsed = Date.now() - start;
			const any_icon =
				$("." + BTN_CLASS).length > 0;
			const any_menu_item =
				frappe.app &&
				frappe.app.sidebar &&
				frappe.app.sidebar.sidebar_header &&
				frappe.app.sidebar.sidebar_header.dropdown_items &&
				frappe.app.sidebar.sidebar_header.dropdown_items.some(
					(d) => d && d.name === SIDEBAR_HEADER_ITEM_NAME
				);
			if (elapsed >= duration_ms || (any_icon && any_menu_item)) {
				clearInterval(_retryHandle);
				_retryHandle = null;
			}
		}, 150);
	}

	// ----------------------------------------------------------------
	// Wire up the events.
	// ----------------------------------------------------------------
	$(document).on("app_ready", function () {
		patch();
		start_retry_window(2000);
	});

	if (frappe.router && typeof frappe.router.on === "function") {
		frappe.router.on("change", function () {
			setTimeout(function () {
				patch();
				start_retry_window(1500);
			}, 50);
		});
	}
})();
