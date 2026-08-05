app_name = "pb_material"
app_title = "PB Material"
app_publisher = "Processbricks"
app_description = "PB Material"
app_email = "venkatnarasimha@processbricks.com"
app_license = "mit"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "pb_material",
# 		"logo": "/assets/pb_material/logo.png",
# 		"title": "PB Material",
# 		"route": "/pb_material",
# 		"has_permission": "pb_material.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
app_include_css = ["/assets/pb_material/css/material.css",
                   ]
app_include_js = [
                    "/assets/pb_material/js/material.js",
                    "/assets/pb_material/js/material-theme-customizer.js",
                    "/assets/pb_material/js/theme.js",]

# include js, css files in header of web template
# web_include_css = "/assets/pb_material/css/pb_material.css"
# web_include_js = "/assets/pb_material/js/pb_material.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "pb_material/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Fixtures
# ------------
#
# List of document types for which fixtures should be exported to
# apps/pb_material/fixtures/ when `bench export-fixtures` is run.
# Required by deployment discipline rule #9 — ensures customizations
# travel with the app code instead of living only in dev DB.
#
fixtures = ["Property Setter", "Custom Field"]


# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "pb_material/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "pb_material.utils.jinja_methods",
# 	"filters": "pb_material.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "pb_material.install.before_install"
# after_install = "pb_material.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "pb_material.uninstall.before_uninstall"
# after_uninstall = "pb_material.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "pb_material.utils.before_app_install"
# after_app_install = "pb_material.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "pb_material.utils.before_app_uninstall"
# after_app_uninstall = "pb_material.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "pb_material.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"pb_material.tasks.all"
# 	],
# 	"daily": [
# 		"pb_material.tasks.daily"
# 	],
# 	"hourly": [
# 		"pb_material.tasks.hourly"
# 	],
# 	"weekly": [
# 		"pb_material.tasks.weekly"
# 	],
# 	"monthly": [
# 		"pb_material.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "pb_material.install.before_tests"

# Overriding Methods
# ------------------------------
#
override_whitelisted_methods = {
    "frappe.core.doctype.user.user.switch_theme": "pb_material.overrides.switch_theme.switch_theme"
}

#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "pb_material.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["pb_material.utils.before_request"]
# after_request = ["pb_material.utils.after_request"]

# Job Events
# ----------
# before_job = ["pb_material.utils.before_job"]
# after_job = ["pb_material.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"pb_material.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

