import frappe

def execute():
    """Add 'Material' option to desk_theme field in User DocType (v16-safe).

    Replaces the previous v15-era patch which called `user_doctype.save()`.
    Frappe v16 tightened DocType.save() validation, causing a
    `TypeError: first argument must be a string, not bytes` failure.

    This v16-safe version uses `frappe.make_property_setter()` with v16's
    dict-arg signature. The dict key is `fieldname` (developer-friendly
    name like "desk_theme"), NOT `doc_name` (auto-generated name like
    "thord3qn8v") — that was a v15 holdover and was the bug in v1/v2.

    The `ignore_validate=True` argument bypasses v16's stricter field
    validation (v15 didn't validate on property setter creation).

    `frappe.clear_cache(doctype=doctype)` flushes the cached DocType meta
    so the new options show up immediately on form load. Without this,
    users need to run `bench clear-cache` manually.

    For full v15 compatibility, this would need a version-conditional branch.
    Per project decision (2026-08-03), this fork targets v16 only.

    Verified on pberpdev.duckdns.org (Frappe v16.13.0, ERPNext v16.11.0).
    After running, `frappe.get_meta("User").get_field("desk_theme").options`
    returns "Light\nDark\nAutomatic\nMaterial".
    """

    print("Running Patch: add_theme_setting_user (v16-safe)")

    doctype = "User"
    fieldname = "desk_theme"
    new_options_to_add = ["Material"]

    # Get the User DocType and find the desk_theme field (raw access, not meta)
    user_doctype = frappe.get_doc("DocType", doctype)
    desk_theme_field = None
    for f in user_doctype.fields:
        if f.fieldname == fieldname:
            desk_theme_field = f
            break

    if not desk_theme_field:
        print(f"ERROR: Field '{fieldname}' not found in {doctype}")
        return

    # Parse current options (filter empty strings)
    current_options = (desk_theme_field.options or "").split("\n")
    current_options = [opt for opt in current_options if opt]

    # Build new options list (idempotent — won't double-add if re-run)
    new_options = current_options.copy()
    added = []
    for opt in new_options_to_add:
        if opt not in new_options:
            new_options.append(opt)
            added.append(opt)

    if not added:
        print(f"All options {new_options_to_add} already exist in {fieldname} field")
        return

    new_options_str = "\n".join(new_options)

    # v16 make_property_setter: dict with `fieldname` key (NOT `doc_name`)
    # ignore_validate=True bypasses v16's stricter field validation
    frappe.make_property_setter(
        {
            "doctype": doctype,
            "doctype_or_field": "DocField",
            "fieldname": fieldname,
            "property": "options",
            "value": new_options_str,
            "property_type": "Text",
        },
        ignore_validate=True,
    )
    frappe.db.commit()

    # Flush cached DocType meta so the new options show up immediately
    frappe.clear_cache(doctype=doctype)

    print(f"Successfully added {added} to {fieldname} options in {doctype} DocType")
