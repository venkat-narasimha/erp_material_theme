# Frappe module root for the pb_material app.
#
# DO NOT DELETE THIS FILE OR THE DIRECTORY.
#
# This nested package exists because Frappe's app loader does
# `frappe.get_module(app_name + "." + module_name)` during
# `bench install-app` to discover DocTypes, modules, and patches.
# The module name comes from `pb_material/modules.txt` and matches
# the app name. Python imports the nested package by importing
# `pb_material.pb_material`, which requires this `__init__.py`.
#
# Empty content is fine — Frappe only needs the package marker.
# Any code here is not auto-loaded by Frappe (use `hooks.py` for that).
#
# See apps/frappe/frappe/model/sync.py:117 for the loader code.