import frappe

def execute():
    """Add 'Material' option to desk_theme field in User DocType (v16-safe).

    Replaces itrostack's v15-era patch which called `user_doctype.save()`.
    Frappe v16 tightened DocType.save() validation, causing a
    `TypeError: first argument must be a string, not bytes` failure.

    This v16-safe version uses `frappe.make_property_setter()` to modify
    the field's options property without triggering a full DocType save.
    """

    print("Running Patch: add_theme_setting_user (v16-safe)")

    doctype_name = "User"
    field_name = "desk_theme"
    new_options_to_add = ["Material"]

    # Get the User DocType and find the desk_theme field
    user_doctype = frappe.get_doc("DocType", doctype_name)
    desk_theme_field = None
    for f in user_doctype.fields:
        if f.fieldname == field_name:
            desk_theme_field = f
            break

    if not desk_theme_field:
        print(f"ERROR: Field '{field_name}' not found in {doctype_name}")
        return

    # Parse current options (filter empty strings)
    current_options = (desk_theme_field.options or "").split("\n")
    current_options = [opt for opt in current_options if opt]

    # Build new options list (idempotent)
    new_options = current_options.copy()
    added = []
    for opt in new_options_to_add:
        if opt not in new_options:
            new_options.append(opt)
            added.append(opt)

    if not added:
        print(f"All options {new_options_to_add} already exist in {field_name} field")
        return

    new_options_str = "\n".join(new_options)

    # Use Property Setter (v16-safe way to modify field options)
    # This avoids DocType.save() which breaks on v16 for in-place field changes
    frappe.make_property_setter({
        "doctype": doctype_name,
        "doctype_or_field": "DocField",
        "doc_name": desk_theme_field.name,
        "property": "options",
        "value": new_options_str,
        "property_type": "Text",
    })
    frappe.db.commit()
    print(f"Successfully added {added} to {field_name} options in {doctype_name} DocType")
