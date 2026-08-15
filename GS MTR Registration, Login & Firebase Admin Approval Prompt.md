# GS MTR — Registration, Login & Firebase Admin Approval

Implement a complete **GS MTR registration, login, and admin approval system** using the **existing GS MTR application theme and components**.

Use the reference screenshots only for the **form-field structure and authentication flow**.

Do not add ID-card upload, selfie, photo verification, or any AirNexus-related content.

---

## 1. User Registration

Create a **Request Registration** screen.

### Personal Information

- **Full Name*** — text input
- **Category*** — Officer / Airman
- **BD Number*** — text/number input
- **Retired** — checkbox, default `false`

### Service Details

- **Rank*** — dropdown
- **Branch/Trade*** — dropdown
- **Course** — text input
- **Date of Commission*** — date picker
- **Designation** — text input
- **Office/Unit** — text input

### Contact

- **Email*** — email input
- **Mobile Number*** — phone input

### Security

- **Password*** — password input with show/hide
- **Confirm Password*** — password input with show/hide

Button:

**Request Registration**

---

# 2. Registration Workflow

When the user submits registration:

```text id="a4trb7"
User fills registration form
        ↓
Client-side validation
        ↓
Firebase Authentication account creation
        ↓
Create user profile in Firestore
        ↓
status = "pending"
        ↓
role = "user"
        ↓
Admin reviews registration
        ↓
Approve / Decline
```

The user must **not be allowed to access GS MTR contacts while status is `pending`**.

---

# 3. Firebase Authentication

Use **Firebase Authentication** for login credentials.

Recommended:

```text id="v5xjv8"
Firebase Authentication
        +
Cloud Firestore
        +
Firebase Security Rules
```

Never store passwords inside Firestore.

The user's password must only be handled by Firebase Authentication.

---

# 4. Firestore User Profile

Create a user document:

```text id="g9n4cw"
users/{uid}
```

Suggested fields:

```text
uid
fullName
category
bdNumber
retired
rank
branch
trade
course
commissionDate
designation
office
email
mobile
role
status
createdAt
updatedAt
approvedAt
approvedBy
declinedAt
declinedBy
declineReason
```

Initial registration:

```text id="h9z6s0"
role: "user"
status: "pending"
```

---

# 5. Login

Login form:

### BD Number

Placeholder:

`e.g. 10498`

### Password

Placeholder:

`Enter your password`

Include:

- Show/hide password
- Remember me
- Forgot Password

Button:

**Sign In**

---

# 6. BD Number Login

If the UI requires **BD Number + Password**, do not store passwords against BD numbers manually.

Use a secure mapping between the BD Number and Firebase Authentication identity.

Recommended approach:

```text id="8xk0p2"
BD Number
    ↓
Find authenticated user's identity
    ↓
Firebase Authentication
    ↓
Authenticate
    ↓
Load users/{uid}
    ↓
Check status
    ↓
Allow / deny access
```

Do not implement custom plaintext password authentication.

---

# 7. Account Status Check

After Firebase Authentication succeeds, immediately check:

```text id="z1e4yo"
users/{uid}.status
```

### pending

Do not allow contact access.

Display:

**Your registration is pending admin approval.**

### approved

Allow access to GS MTR contacts.

### declined

Do not allow access.

Display an appropriate message and, if available, the administrator's decline reason.

### suspended

Block access.

Display:

**Your account has been suspended. Please contact the administrator.**

---

# 8. Admin Login

Administrators use the same authentication system.

After login:

```text id="7m3w3a"
Firebase Authentication
        ↓
Load users/{uid}
        ↓
Check role
        ↓
admin / super_admin
        ↓
Show Admin Features
```

Regular users must not see admin functionality.

---

# 9. Admin Settings Menu

When an **admin or super_admin** logs in, add a:

**Settings**

menu/item to the existing GS MTR navigation.

Inside Settings add:

### Pending Approvals

Example:

```text id="q6b9u2"
Settings
 ├── Pending Approvals
 ├── User Management
 └── Other existing settings
```

For regular users:

**Do not show Pending Approvals.**

---

# 10. Pending Approvals

Create a dedicated:

**Pending Approvals**

screen.

Display all registration requests where:

```text id="a7n2pj"
status == "pending"
```

Show useful information in each pending-registration item:

- Full Name
- Category
- BD Number
- Retired
- Rank
- Branch/Trade
- Course
- Date of Commission
- Designation
- Office/Unit
- Email
- Mobile
- Registration date

Do not expose unnecessary sensitive information.

---

# 11. Approval Details

When an admin selects a pending registration, open a detailed view.

Display the complete submitted registration information.

Example:

```text id="e9u6vb"
Full Name: John Doe
Category: Officer
BD Number: 10498
Rank: Sgt
Branch: Example
Course: DE2022B
Commission Date: ...
Designation: ...
Office: ...
Email: ...
Mobile: ...
Retired: No
```

Provide two clear actions:

### Approve

Button:

**Approve Registration**

### Decline

Button:

**Decline Registration**

---

# 12. Approve Workflow

When admin selects **Approve**:

```text id="9zzc9c"
Admin clicks Approve
        ↓
Confirm approval
        ↓
Update Firestore user status
        ↓
status = "approved"
        ↓
approvedAt = server timestamp
        ↓
approvedBy = admin UID
        ↓
User can now log in
        ↓
User can access GS MTR contacts
```

Show confirmation:

**Registration approved successfully.**

Remove the request from the Pending Approvals list.

---

# 13. Decline Workflow

When admin selects **Decline**:

Show a confirmation dialog.

Optionally request:

**Reason for decline**

Example:

`Please provide a reason for declining this registration.`

Then:

```text id="b6y2nt"
Admin clicks Decline
        ↓
Optional decline reason
        ↓
status = "declined"
        ↓
declinedAt = server timestamp
        ↓
declinedBy = admin UID
        ↓
User cannot access contacts
```

Show:

**Registration declined.**

Remove it from Pending Approvals.

---

# 14. Pending Approval Badge

Show a badge/count beside:

**Pending Approvals**

Example:

```text id="7pgy4m"
Pending Approvals   5
```

The number should represent the current number of pending registrations.

When an approval is completed:

```text id="k2qg3h"
5 → 4
```

Update the count automatically.

Use a Firestore real-time listener where appropriate.

---

# 15. Firebase Security

Security is critical.

Do not rely only on hiding menu items in the frontend.

Firestore Security Rules must ensure:

### Regular users

Can:

- Read their own user profile
- Access contacts only when `status == "approved"`
- Access only contacts permitted by their role

Cannot:

- Approve registrations
- Decline registrations
- Change their own role
- Change their own approval status
- Modify another user's profile
- Access pending registration records belonging to others

### Admin

Can:

- View pending registrations
- Approve registrations
- Decline registrations
- Manage users according to permissions

### Super Admin

Can:

- Manage administrators
- Manage users
- Approve/decline registrations
- Manage all GS MTR data

---

# 16. Important Security Rule

Never allow a normal user to update:

```text id="8x3d2p"
role
status
approvedAt
approvedBy
declinedAt
declinedBy
```

These fields must only be changed by authorized administrators/backend logic.

---

# 17. Recommended Approval Data Flow

```text id="n4h3w2"
                 Firebase
                    │
          ┌─────────┴─────────┐
          │                   │
 Firebase Auth          Firestore
          │                   │
          │             User Profile
          │                   │
          │              status=pending
          │                   │
          └──────────┬────────┘
                     │
                 Admin Login
                     │
                  Settings
                     │
             Pending Approvals
                     │
             ┌───────┴────────┐
             │                │
          APPROVE           DECLINE
             │                │
       status=approved   status=declined
             │
             ↓
       User Login
             ↓
      Access GS MTR Contacts
```

---

# 18. Contact Access Protection

The most important business rule:

```text id="2m8c1n"
IF authenticated user.status == "approved"
    → allow contact access

IF status == "pending"
    → deny contact access

IF status == "declined"
    → deny contact access

IF status == "suspended"
    → deny contact access
```

This restriction must be enforced at the **Firebase Security Rules/backend level**, not only through frontend navigation.

---

# 19. Existing GS MTR Theme

Use the **existing GS MTR theme** for:

- Registration
- Login
- Settings
- Pending Approvals
- Approval Details
- Confirmation dialogs
- Buttons
- Forms
- Status badges

Do not create a separate authentication design system.

Reuse existing GS MTR components wherever possible.

---

# 20. Final Requirements

Implement:

- Registration
- Firebase Authentication
- Firestore user profiles
- Pending account status
- Admin authentication
- Admin Settings menu
- Pending Approvals menu
- Pending approval count
- Registration details screen
- Approve button
- Decline button
- Decline reason
- Automatic status updates
- Approved-user access
- Pending-user restriction
- Declined-user restriction
- Suspended-user restriction
- Role-based access
- Firebase Security Rules
- Secure password handling
- Forgot Password
- Remember Me
- Logout

### Do NOT implement:

- ID card upload
- Selfie
- Profile photo
- Photo verification
- AirNexus branding
- AirNexus theme

The completed system should integrate naturally into the **existing GS MTR application** and use its current theme, navigation, components, and contact-management functionality.