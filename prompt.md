# 🎨 SWIFTSETTLE - DETAILED PAGE COMPOSITION & LAYOUT FLOW

**Tech Stack**: React Vite + TailwindCSS  
**Design Philosophy**: Minimal, professional, functional (no unnecessary gradients or icons)  
**Image Source**: Unsplash API integration

---

# **1. LANDING PAGE**

## **Page Structure**

### **Section 1: Hero / Above the Fold**

**Layout**: Split screen (50/50)

- **Left Side (Text)**
  - Main heading: "Real-Time Earnings for Every Gig Worker"
  - Body text (2 lines): "Stop waiting days for your money. Get paid instantly. SwiftSettle powers the settlement layer for Nigeria's gig economy."
  - CTA Button: "Start Settling Now" (blue, solid, no rounded corners - modern clean)
  - Secondary text: "Join 10,000+ workers earning on their terms"

- **Right Side (Image)**
  - Unsplash image: Search query `"delivery worker phone mobile app" OR "gig worker payment dashboard"`
  - Image size: Full height of hero section
  - Image styling: No overlay, clean edges

**Typography**:

- H1: 48px, font-weight 700, line-height 1.2
- Body: 16px, font-weight 400, text-gray-700
- Spacing: 60px top/bottom padding

**Colors**:

- Background: #FFFFFF (white)
- Text: #1F2937 (dark gray)
- CTA Button: #2563EB (blue)
- Button text: white

---

### **Section 2: The Problem (Social Proof)**

**Layout**: Full width, centered content

- **Heading**: "The Problem is Real"
- **Subheading**: "15 million Nigerian gig workers face the same barrier every day"

**Content Grid**: 3 columns, equal width

1. **Column 1**
   - Number: "3-7 DAYS"
   - Label: "Average payment delay"
   - Description: "Workers wait a week to access earnings they need today"
2. **Column 2**
   - Number: "20-30%"
   - Label: "Interest on emergency loans"
   - Description: "Forced to borrow at predatory rates just to survive the wait"

3. **Column 3**
   - Number: "40%"
   - Label: "Platform attrition rate"
   - Description: "Workers switch platforms chasing faster payouts"

**Card styling**:

- Background: #F3F4F6 (light gray)
- No borders, subtle shadow (0 4px 6px rgba(0,0,0,0.07))
- Padding: 32px
- Border-radius: 0px (sharp corners)

**Typography**:

- H2: 32px, 700 weight
- Numbers: 36px, 700 weight, #2563EB
- Description: 14px, 400 weight, text-gray-600

---

### **Section 3: The Problem Visualized (Story)**

**Layout**: Full width with image on left, text on right

**Left Side (Image)**

- Unsplash image: `"nigerian delivery rider tired" OR "gig worker stress" OR "worker on phone"`
- Image ratio: 16:9
- Height: 400px

**Right Side (Text)**

- Heading: "Meet Chioma"
- Body text (realistic story):

  ```
  Chioma completes 25 deliveries on Monday, earning ₦12,500.

  But she can't pay her rent. The platform doesn't settle
  until Friday. So she borrows ₦10,000 at 25% interest to
  cover this week's expenses.

  By Friday, she's earned less after interest than if she'd
  just waited. This happens every week.

  She's not struggling because deliveries aren't profitable.
  She's struggling because payment delays force her into debt.
  ```

**CTA**: "This is why SwiftSettle exists" (text link, no button)

**Spacing**: 80px vertical margin between sections

---

### **Section 4: The Solution**

**Layout**: Centered content, full width

**Heading**: "Introducing SwiftSettle"
**Subheading**: "Instant settlement. Built on Nomba. For everyone."

**What SwiftSettle Does**: 3-column grid

1. **Column 1: Live Dashboard**
   - Subheading: "Real-Time Earnings"
   - Description: "See your balance update live as orders complete. No refresh. No delay. Just instant visibility."
   - Image from Unsplash: `"analytics dashboard mobile" OR "finance app interface"`

2. **Column 2: One-Tap Settlement**
   - Subheading: "Instant Settlement"
   - Description: "Hit 'Cash Out Now' and your money transfers to your bank within minutes. Same day. Every time."
   - Image from Unsplash: `"payment confirmation successful" OR "mobile transfer"`

3. **Column 3: Trust Built**
   - Subheading: "Platform Loyalty"
   - Description: "Workers stop chasing other platforms. Platforms reduce attrition by 30%. Everyone wins."
   - Image from Unsplash: `"team collaboration working" OR "diverse workers"`

**Card Structure**:

- Image: Full width, 200px height, object-cover
- Text below image: 16px, 400 weight
- Background: white
- Border: 1px solid #E5E7EB
- Padding: 20px
- No border-radius

---

### **Section 5: How It Works (Process Flow)**

**Layout**: Vertical timeline, single column centered

**Heading**: "How SwiftSettle Works"

**4-Step Process** (vertical layout):

**Step 1**:

- Number: "01"
- Heading: "Worker logs in"
- Description: "Simple mobile or web login. One-time setup of your bank account."
- Image: Unsplash `"phone login interface"`
- Position: Text on left, image on right (50/50)

**Step 2**:

- Number: "02"
- Heading: "Earnings accumulate in real-time"
- Description: "As you complete deliveries, your balance updates instantly. No waiting for end-of-day reconciliation."
- Image: Unsplash `"dashboard with numbers" OR "mobile app metrics"`
- Position: Text on right, image on left (alternating)

**Step 3**:

- Number: "03"
- Heading: "Tap 'Cash Out Now'"
- Description: "One button. Any time. Your money settles to your bank account within minutes."
- Image: Unsplash `"payment success screen"`
- Position: Text on left, image on right

**Step 4**:

- Number: "04"
- Heading: "Confirmation & Receipt"
- Description: "Push notification + SMS confirmation. Your money is there. You're done."
- Image: Unsplash `"phone notification success"`
- Position: Text on right, image on left

**Styling for steps**:

- Section padding: 60px top/bottom
- Number: 64px, 700 weight, #E5E7EB (light gray)
- Heading: 24px, 700 weight, #1F2937
- Description: 16px, 400 weight, #6B7280 (medium gray)
- Image height: 300px
- Image border: 1px solid #E5E7EB

---

### **Section 6: Why Nomba + Why SwiftSettle**

**Layout**: 2 columns

**Left Column (Why Nomba)**:

- Heading: "Built on Nomba"
- Subheading: "Infrastructure that scales"
- Description: "SwiftSettle uses Nomba's Virtual Accounts, Transfers API, and Webhooks to power instant settlements. Nomba's infrastructure is proven, secure, and built for African fintech."
- Bullet points (no actual bullets, just text):
  - "Virtual Accounts track earnings per worker"
  - "Transfers API settles money same-day"
  - "Webhooks automate the entire flow"
  - "No custom payment infrastructure needed"

**Right Column (Why SwiftSettle)**:

- Heading: "The Platform Layer"
- Subheading: "We do the hard work"
- Description: "Nomba handles payments. SwiftSettle handles the user experience, reconciliation, worker management, and platform integration."
- Bullet points:
  - "Frictionless worker onboarding"
  - "Real-time earnings visibility"
  - "Automatic reconciliation"
  - "Platform admin dashboard"

**Background**: #F9FAFB (very light gray)
**Padding**: 80px
**Border-radius**: 0px
**Text color**: #374151 (charcoal)

---

### **Section 7: Market Size & Impact**

**Layout**: Full width, centered content

**Heading**: "The Opportunity"

**3 metrics displayed horizontally**:

1. **Left Metric**:
   - Large number: "15M+"
   - Description: "Gig workers in Nigeria waiting for real-time settlement"
   - Subtext: "And growing 25% annually"

2. **Center Metric**:
   - Large number: "₦500B+"
   - Description: "Annual economic impact of payment delays"
   - Subtext: "Estimated cost to Nigeria's gig economy"

3. **Right Metric**:
   - Large number: "30%"
   - Description: "Estimated reduction in platform attrition"
   - Subtext: "When workers get paid same-day"

**Typography**:

- Numbers: 48px, 700 weight, #2563EB
- Description: 16px, 400 weight, #1F2937
- Subtext: 14px, 400 weight, #6B7280

**Spacing**: 100px between metrics

---

### **Section 8: CTA Section (Before Footer)**

**Layout**: Full width, centered

**Background**: #1F2937 (dark gray)
**Text color**: white

**Content**:

- Heading: "Ready to stop waiting?"
- Subheading: "Join the settlement revolution"
- CTA Button: "Start as a Worker" (white text, dark border)
- Secondary CTA: "Integrate for Your Platform" (white text, white border)
- Button spacing: 20px between them

**Padding**: 80px

---

### **Section 9: Footer**

**Layout**: 4 columns + bottom bar

**Column 1 - Product**:

- Heading: "Product"
- Links:
  - Features
  - Pricing
  - Security
  - Roadmap

**Column 2 - Company**:

- Heading: "Company"
- Links:
  - About
  - Blog
  - Careers
  - Contact

**Column 3 - Resources**:

- Heading: "Resources"
- Links:
  - Documentation
  - API Docs
  - Support
  - Status

**Column 4 - Legal**:

- Heading: "Legal"
- Links:
  - Privacy Policy
  - Terms of Service
  - Cookie Policy
  - Security

**Bottom Bar**:

- Copyright: "© 2026 SwiftSettle. All rights reserved."
- Text alignment: center
- Border-top: 1px solid #E5E7EB

**Footer colors**:

- Background: #F9FAFB (light gray)
- Text: #6B7280 (medium gray)
- Headings: #1F2937 (dark gray)
- Padding: 60px

---

---

# **2. WORKER LOGIN PAGE**

## **Page Structure**

**Layout**: 2 columns (50/50)

### **Left Side - Form**

**Background**: white
**Width**: 50% of screen
**Padding**: 60px

**Content** (top to bottom):

1. **Logo/Brand**:
   - Text: "SwiftSettle"
   - Font-size: 24px, 700 weight
   - Color: #2563EB

2. **Heading**:
   - "Welcome Back"
   - Font-size: 32px, 700 weight
   - Margin-top: 40px

3. **Subheading**:
   - "Sign in to your account"
   - Font-size: 16px, 400 weight
   - Color: #6B7280
   - Margin-bottom: 40px

4. **Form Fields**:

   **Field 1: Phone Number**
   - Label: "Phone Number"
   - Placeholder: "+234 (0) 800 000 0000"
   - Input styling:
     - Border: 1px solid #D1D5DB
     - Padding: 12px 16px
     - Font-size: 14px
     - Border-radius: 4px
   - Help text: "We'll send you an OTP to verify"
   - Font-size: 12px, color #6B7280

   **Field 2: OTP (appears after phone submission)**
   - Label: "Enter OTP"
   - Placeholder: "000000"
   - Input styling: Same as above
   - Help text: "Check your phone or email"
   - Font-size: 12px, color #6B7280

5. **Submit Button**:
   - Text: "Sign In"
   - Full width
   - Padding: 12px
   - Background: #2563EB
   - Text color: white
   - Font-weight: 500
   - Border-radius: 4px
   - On hover: #1D4ED8 (darker blue)

6. **Footer Links** (centered, below button):
   - "Don't have an account?" | "Sign up"
   - Font-size: 14px
   - Color: #6B7280 for text, #2563EB for link
   - Margin-top: 20px

---

### **Right Side - Image**

**Background**: #F3F4F6 (light gray)
**Content**:

- Unsplash image: `"delivery worker smiling" OR "gig worker success" OR "nigerian worker happy"`
- Image sizing: cover, center
- Height: Full viewport height
- Overlay: None (clean image)

**Optional Text Overlay** (bottom-right corner of image):

- Small quote: "I now get paid same day. Life has changed."
- Attribution: "- Chioma, Delivery Driver"
- Font-size: 14px
- Color: white
- Background: rgba(0,0,0,0.3) (subtle dark overlay behind text only)
- Padding: 16px
- Position: absolute, bottom: 30px, right: 30px

---

---

# **3. WORKER SIGNUP PAGE**

## **Page Structure**

**Same as Login Page but with more form fields**

### **Left Side - Form**

**Logo & Heading**:

- Logo: "SwiftSettle" (24px, 700 weight, #2563EB)
- Heading: "Get Started"
- Subheading: "Create your SwiftSettle account in 2 minutes"

**Form Fields** (step by step):

**Step 1: Personal Information**

1. **Full Name**
   - Label: "Full Name"
   - Placeholder: "Chioma Adeyemi"
   - Input styling: Same as login page

2. **Email Address**
   - Label: "Email Address"
   - Placeholder: "chioma@example.com"
   - Input styling: Same as login page

3. **Phone Number**
   - Label: "Phone Number"
   - Placeholder: "+234 (0) 800 000 0000"
   - Input styling: Same as login page

4. **Date of Birth**
   - Label: "Date of Birth"
   - Format: DD/MM/YYYY
   - Input styling: Same as login page

**Step 2: Bank Details**

5. **Bank Account Number**
   - Label: "Bank Account Number"
   - Placeholder: "1234567890"
   - Input styling: Same as login page
   - Help text: "Where we'll settle your earnings"

6. **Bank Name**
   - Label: "Select Your Bank"
   - Type: Dropdown (not a text input)
   - Placeholder: "Choose your bank"
   - Styling: Same borders/padding as text inputs
   - Options: Pre-populated with major Nigerian banks (GTB, FirstBank, Access, UBA, etc.)

7. **Account Type**
   - Label: "Account Type"
   - Type: Radio buttons (inline)
   - Options: "Savings" | "Checking"
   - Default: "Savings"

**Step 3: Security**

8. **Password**
   - Label: "Create Password"
   - Placeholder: "••••••••"
   - Input type: password
   - Help text: "Minimum 8 characters, 1 uppercase, 1 number"
   - Input styling: Same as others

9. **Confirm Password**
   - Label: "Confirm Password"
   - Placeholder: "••••••••"
   - Input type: password
   - Input styling: Same as others

**Step 4: Verification**

10. **OTP Verification**
    - Label: "Verify Your Phone"
    - Button: "Send OTP" (secondary button, not filled)
    - Input field appears after clicking "Send OTP"
    - Placeholder: "000000"
    - Input styling: Same as others
    - Countdown timer: "Resend in 30s" (text only, no visual timer)

**Checkbox - Terms & Conditions**:

- Text: "I agree to the Terms of Service and Privacy Policy"
- Font-size: 14px
- Checkbox styling: Standard HTML checkbox, styled with TailwindCSS
- Required: Yes (form can't submit without this)

**Submit Button**:

- Text: "Create Account"
- Full width
- Styling: Same as login page
- State when submitting: Text changes to "Creating..." (disabled)

**Footer**:

- "Already have an account?" | "Sign in"
- Font-size: 14px
- Color: #6B7280 for text, #2563EB for link

---

### **Right Side - Image**

Same as login page: Unsplash image of gig worker

---

---

# **4. WORKER DASHBOARD (Main App)**

## **Page Structure**

**Layout**: Sidebar + Main Content Area

### **Sidebar (Left, Fixed)**

**Width**: 280px
**Background**: white
**Border-right**: 1px solid #E5E7EB

**Content** (top to bottom):

1. **Logo Section**:
   - Logo text: "SwiftSettle"
   - Font-size: 20px, 700 weight
   - Color: #2563EB
   - Padding: 20px
   - Border-bottom: 1px solid #E5E7EB

2. **Navigation Menu**:
   - Items (vertical list):
     - Dashboard (icon: house, text: "Dashboard")
     - Earnings (icon: trending-up, text: "Earnings")
     - Settlements (icon: check-circle, text: "Settlements")
     - Settings (icon: gear, text: "Settings")
     - Support (icon: help-circle, text: "Support")
   - Styling per item:
     - Padding: 12px 16px
     - Font-size: 14px
     - Color: #6B7280 (inactive)
     - Color: #2563EB (active)
     - Background: #DBEAFE (light blue) for active item
     - Hover background: #F3F4F6
     - Border-left: 3px solid #2563EB (active items only)
     - Cursor: pointer

3. **Bottom Section** (stick to bottom):
   - User profile mini card:
     - Avatar placeholder: Circular gray box (40x40px)
     - Name: "Chioma A."
     - Phone: "+234 801 234 5678"
     - Font-size: 12px
     - Padding: 16px
     - Border-top: 1px solid #E5E7EB
   - Logout button:
     - Text: "Sign Out"
     - Full width
     - Styling: Gray background (#F3F4F6), gray text (#6B7280)
     - Padding: 12px
     - Font-size: 14px
     - Border-radius: 4px

---

### **Main Content Area (Right)**

**Background**: #F9FAFB (very light gray)
**Padding**: 40px

**Section 1: Top Bar (Header)**

**Content** (horizontal layout):

- Left: Page title "Dashboard"
- Right: Date/time display "Monday, July 3rd, 2026 | 2:34 PM"

**Typography**:

- Title: 28px, 700 weight, #1F2937
- Date: 14px, 400 weight, #6B7280

---

**Section 2: Balance Card (Hero)**

**Layout**: Full width, single card

**Card Styling**:

- Background: #2563EB (blue)
- Text color: white
- Padding: 32px
- Border-radius: 8px
- Box-shadow: 0 4px 6px rgba(0,0,0,0.1)

**Content** (left to right):

1. **Left Side**:
   - Label: "Available Balance"
   - Font-size: 12px, font-weight 500, opacity 0.9
   - Amount: "₦12,450"
   - Font-size: 36px, 700 weight
   - Subtext: "Updated 2 minutes ago"
   - Font-size: 12px, opacity 0.8

2. **Right Side**:
   - Big green button: "Settle Now"
   - Background: #10B981 (green)
   - Text: white
   - Padding: 12px 32px
   - Font-size: 14px, 600 weight
   - Border-radius: 4px
   - On hover: #059669 (darker green)
   - On click: Loading state "Processing..."

---

**Section 3: Today's Earnings (Summary)**

**Layout**: 3-column grid

**Card 1: Today's Earnings**

- Background: white
- Padding: 24px
- Border-radius: 8px
- Border: 1px solid #E5E7EB
- Content:
  - Label: "Today's Earnings"
  - Font-size: 12px, color #6B7280
  - Amount: "₦4,500"
  - Font-size: 24px, 700 weight, #1F2937
  - Trend: "+₦1,200 from yesterday" (green text, small)

**Card 2: Pending Payouts**

- Same styling as Card 1
- Content:
  - Label: "Pending Payouts"
  - Amount: "₦0"
  - Subtext: "All settled" (green text, small)

**Card 3: This Week's Total**

- Same styling as Card 1
- Content:
  - Label: "This Week's Total"
  - Amount: "₦28,750"
  - Subtext: "7 days of work"

---

**Section 4: Earnings Activity (Timeline)**

**Heading**: "Today's Activity"
**Font-size**: 14px, 700 weight

**Content**: Vertical list of transactions

**Each transaction row**:

- Left: Order type (text): "Delivery completed"
- Middle: Time: "2:15 PM"
- Right: Amount: "+₦1,250" (green)

**Row styling**:

- Padding: 12px 0
- Border-bottom: 1px solid #E5E7EB
- Font-size: 14px
- Text color: #1F2937

**Last row**: No border-bottom

**Empty state** (if no activity):

- "No activity yet today" (gray text, centered)
- Font-size: 14px, color #9CA3AF

---

**Section 5: Payment Methods**

**Heading**: "Your Payment Methods"

**Card**:

- Background: white
- Padding: 24px
- Border-radius: 8px
- Border: 1px solid #E5E7EB
- Content:
  - Bank name: "Guaranty Trust Bank (GTB)"
  - Account number: "\***\* \*\*** \*\*\*\* 5678"
  - Account holder: "Chioma Adeyemi"
  - Font-size: 14px
  - Text color: #6B7280
  - "Primary account" badge (small, blue background, white text)

**Edit button**:

- Text: "Edit"
- Float right
- Background: none
- Color: #2563EB
- Font-size: 14px
- Cursor: pointer

---

---

# **5. SETTLEMENTS PAGE**

## **Page Structure**

**Sidebar**: Same as Dashboard
**Main Content Area**: Similar layout to Dashboard

### **Content**

**Section 1: Header**

- Title: "Settlements"
- Subtitle: "View all your past and pending payouts"

---

**Section 2: Filter Bar**

**Layout**: Horizontal, full width

**Filters**:

1. **Date Range Picker**
   - Label: "Date Range"
   - Input type: Date picker
   - Default: "Last 30 days"
   - Styling: White background, 1px border #D1D5DB

2. **Status Filter**
   - Label: "Status"
   - Type: Dropdown
   - Options: "All" | "Completed" | "Pending" | "Failed"
   - Styling: Same as date picker

3. **Search**
   - Placeholder: "Search by reference or amount"
   - Input styling: Same
   - Width: Auto (grows to fit available space)

**Button**: "Reset Filters" (text link, color #2563EB)

---

**Section 3: Settlements Table**

**Table layout** (responsive, horizontal scroll on mobile):

| Column        | Content                                                          |
| ------------- | ---------------------------------------------------------------- |
| **Date**      | Settlement date (e.g., "3 Jul 2026")                             |
| **Time**      | Settlement time (e.g., "2:34 PM")                                |
| **Amount**    | Amount settled (e.g., "₦5,000")                                  |
| **Reference** | Transaction reference (e.g., "SW-2026-001234")                   |
| **Status**    | Badge: "Completed" (green) / "Pending" (yellow) / "Failed" (red) |
| **Receipt**   | Link: "View" or Download icon                                    |

**Table styling**:

- Background: white
- Header: #F3F4F6 background, 700 weight text, #1F2937 color
- Rows: Alternate white and #FAFBFC background
- Padding per cell: 12px 16px
- Font-size: 14px
- Border-bottom on each row: 1px solid #E5E7EB

**Status Badge styling**:

- Completed: Green background (#D1FAE5), green text (#065F46)
- Pending: Yellow background (#FEF3C7), yellow text (#92400E)
- Failed: Red background (#FEE2E2), red text (#7F1D1D)
- Padding: 4px 8px
- Border-radius: 4px
- Font-size: 12px, 500 weight

---

**Section 4: Summary Card**

**Layout**: 3 columns, below table

**Card 1: Total Settled**

- Label: "Total Settled (30 days)"
- Amount: "₦86,250"
- Styling: Same as dashboard summary cards

**Card 2: Pending Amount**

- Label: "Pending Settlements"
- Amount: "₦0"
- Subtext: "None pending"

**Card 3: Settled Count**

- Label: "Settlements Count"
- Amount: "23"
- Subtext: "transactions"

---

---

# **6. EARNINGS PAGE**

## **Page Structure**

**Sidebar**: Same as Dashboard
**Main Content Area**: Similar layout

### **Content**

**Section 1: Header**

- Title: "Earnings"
- Subtitle: "Track your income and performance"

---

**Section 2: Chart - Weekly Earnings**

**Chart type**: Line chart (using Recharts)
**Background**: white
**Padding**: 24px
**Border-radius**: 8px
**Border**: 1px solid #E5E7EB

**Chart styling**:

- X-axis: Days (Mon, Tue, Wed, etc.)
- Y-axis: Amount (₦0 to ₦10,000+)
- Line color: #2563EB
- Area under line: Light blue fill, opacity 0.1
- Grid: Light gray (#E5E7EB) only on Y-axis
- No background gradient

**Data points**: Hoverable, show exact amount on hover

**Legend**:

- "Daily Earnings" (text, not visual legend)
- Font-size: 12px, color #6B7280
- Positioned below chart

---

**Section 3: Statistics Grid (3 columns)**

**Card 1: Average Daily Earnings**

- Label: "Average Daily Earnings"
- Amount: "₦4,125"
- Subtext: "Over 7 days"
- Change: "+12% from last week" (green)

**Card 2: Best Day**

- Label: "Best Day"
- Amount: "₦8,750"
- Subtext: "Wednesday"
- Comparator: "Normal day: ₦4,000"

**Card 3: Total This Month**

- Label: "Total This Month"
- Amount: "₦86,250"
- Subtext: "21 days worked"

**Card styling**: Same as dashboard summary cards

---

**Section 4: Monthly Breakdown (Bar Chart)**

**Chart type**: Bar chart
**Months**: Last 6 months (Jan - Jun)
**Styling**: Same as line chart

- Bar color: #2563EB
- No gradient
- Grid only on Y-axis

---

**Section 5: Performance Metrics**

**3-column layout**

**Metric 1: Completion Rate**

- Progress bar showing percentage
- Bar color: #2563EB
- Percentage: 98%
- Label: "Order Completion Rate"
- Subtext: "Excellent performance"

**Metric 2: Average Rating**

- Stars (1-5, filled stars in blue)
- Rating: 4.8 / 5
- Based on 247 ratings
- Label: "Customer Rating"

**Metric 3: On-Time Delivery**

- Progress bar
- Percentage: 96%
- Label: "On-Time Deliveries"
- Subtext: "Industry average: 92%"

---

---

# **7. SETTINGS PAGE**

## **Page Structure**

**Sidebar**: Same as Dashboard
**Main Content Area**: Similar layout

### **Content**

**Section 1: Header**

- Title: "Settings"
- Subtitle: "Manage your account and preferences"

---

**Section 2: Account Settings**

**Card**: White, padding 24px, border 1px solid #E5E7EB

**Content**:

**Subsection 1: Personal Information**

- Label: "Personal Information"
- Font-size: 14px, 700 weight, #1F2937

**Fields** (display only with Edit button):

- Full Name: "Chioma Adeyemi" (with Edit pencil icon)
- Email: "chioma@example.com" (with Edit)
- Phone: "+234 801 234 5678" (with Edit)
- Date of Birth: "15 Mar 1995" (with Edit)

**Edit flow**: Click Edit → Fields become editable → Save/Cancel buttons appear

---

**Subsection 2: Bank Details**

- Label: "Bank Details"
- Font-size: 14px, 700 weight

**Fields**:

- Bank Name: "Guaranty Trust Bank (GTB)" (with Edit)
- Account Number: "\***\* \*\*** \*\*\*\* 5678" (with Edit, shows full on click)
- Account Holder: "Chioma Adeyemi" (read-only)

---

**Section 3: Security**

**Card**: White, padding 24px, border 1px solid #E5E7EB

**Content**:

**Password**:

- Label: "Change Password"
- Current Password: Input field (type: password)
- New Password: Input field (type: password)
- Confirm New Password: Input field (type: password)
- Button: "Update Password" (blue, full width)

**Two-Factor Authentication**:

- Label: "Two-Factor Authentication"
- Toggle switch: OFF (by default)
- Description: "Add an extra layer of security to your account"
- When toggled ON:
  - Text: "2FA is enabled. You'll receive codes via SMS"
  - Button: "Disable 2FA" (red background)

---

**Section 4: Notifications**

**Card**: White, padding 24px, border 1px solid #E5E7EB

**Content**:

**Email Notifications**:

- Toggle 1: "Settlement Confirmations" → ON
- Toggle 2: "Weekly Earnings Summary" → ON
- Toggle 3: "Security Alerts" → ON
- Toggle 4: "Marketing & Promotions" → OFF

**Push Notifications**:

- Toggle 1: "Order Updates" → ON
- Toggle 2: "Settlement Alerts" → ON
- Toggle 3: "Account Activity" → ON

**SMS Notifications**:

- Toggle 1: "Critical Alerts Only" → ON
- Text: "We'll only SMS you for urgent account issues"

**Toggle styling**:

- ON state: Blue background (#2563EB), white circle
- OFF state: Gray background (#D1D5DB), gray circle
- Smooth transition animation

---

**Section 5: Danger Zone**

**Card**: Background #FEE2E2 (light red), padding 24px, border 1px solid #FECACA

**Content**:

**Delete Account**:

- Heading: "Delete Account"
- Description: "Once you delete your account, there is no going back. Please be certain."
- Button: "Delete Account" (red background, white text)
- Button text: #DC2626 (red)

**On click**: Modal popup

- Heading: "Are you sure?"
- Message: "Deleting your account will remove all your data. This cannot be undone."
- Checkbox: "I understand and want to delete my account"
- Buttons: "Cancel" (gray) | "Delete" (red, disabled until checkbox is checked)

---

---

# **8. SUPPORT / HELP PAGE**

## **Page Structure**

**Sidebar**: Same as Dashboard
**Main Content Area**: Similar layout

### **Content**

**Section 1: Header**

- Title: "Help & Support"
- Subtitle: "Get answers to your questions"

---

**Section 2: Search Bar**

**Layout**: Full width

**Search input**:

- Placeholder: "Search for answers... (e.g., 'How do I settle my earnings?')"
- Icon: Search icon on left
- Width: 100%
- Padding: 12px 16px
- Border: 1px solid #D1D5DB
- Border-radius: 4px
- Font-size: 14px

---

**Section 3: Popular Questions**

**Layout**: 3-column grid

**Card 1**:

- Title: "How do I settle my earnings?"
- Category badge: "Settlements" (gray background)
- Excerpt: "Learn how to withdraw your earnings in minutes..."
- Link: "Read More" (blue text)

**Card 2**:

- Title: "How do I update my bank account?"
- Category badge: "Account"
- Excerpt: "Change your bank details or add a new account..."
- Link: "Read More"

**Card 3**:

- Title: "Why is my settlement pending?"
- Category badge: "Troubleshooting"
- Excerpt: "Understand why your settlement might be delayed..."
- Link: "Read More"

**Card styling**:

- Background: white
- Padding: 20px
- Border: 1px solid #E5E7EB
- Border-radius: 4px
- Hover effect: Border color changes to #2563EB

---

**Section 4: FAQ Categories**

**Layout**: 2 columns, full width

**Category 1: Getting Started**

- Accordion items (click to expand):
  - "How do I create an account?" → Expands to show answer
  - "How do I link my bank account?" → Answer
  - "What information do I need to sign up?" → Answer

**Category 2: Earnings & Settlements**

- Accordion items:
  - "How do earnings appear on my dashboard?" → Answer
  - "When are earnings settled?" → Answer
  - "Can I settle whenever I want?" → Answer

**Accordion styling**:

- Header padding: 16px
- Header background: #F9FAFB
- Header border: 1px solid #E5E7EB
- Content padding: 16px
- Content background: white
- Border-radius: 4px
- Chevron icon on right (rotates on expand)

---

**Section 5: Contact Support**

**Card**: White, padding 24px, border 1px solid #E5E7EB

**Content**:

**Heading**: "Still need help?"

**Contact options** (3 columns):

1. **Email Support**
   - Icon: Envelope (simple outline)
   - Title: "Email Us"
   - Email: support@swiftsettle.app
   - Expected response: "24 hours"

2. **Chat Support**
   - Icon: Chat bubble
   - Title: "Live Chat"
   - Status: "Available" (green dot)
   - Time: "Mon-Fri, 9 AM - 6 PM"

3. **Phone Support**
   - Icon: Phone
   - Title: "Call Us"
   - Phone: "+234 800 SETTLE (735835)"
   - Time: "Mon-Fri, 9 AM - 5 PM"

**Column styling**:

- Text align: center
- Padding: 20px
- Hover effect: Light gray background

---

---

# **9. SETTLEMENT MODAL (Triggered from Dashboard)**

## **Modal Structure**

**Trigger**: "Settle Now" button on Dashboard

**Modal styling**:

- Width: 480px (fixed, centered)
- Background: white
- Border-radius: 8px
- Padding: 32px
- Box-shadow: 0 20px 25px rgba(0,0,0,0.15)
- Overlay: Dark background, opacity 0.5

---

**Content**:

**Section 1: Header**

- Heading: "Settle Your Earnings"
- Font-size: 20px, 700 weight
- Close button: X icon, top-right

---

**Section 2: Settlement Details**

**Box**: Light gray background (#F9FAFB), padding 16px, border-radius 4px

**Content** (2 columns layout):

- Left: "Available Balance"
- Right: "₦12,450" (large, 24px, 700 weight, #2563EB)

- Left: "Settlement Fee"
- Right: "Free" (small, gray)

- Left: "You'll Receive"
- Right: "₦12,450" (24px, 700 weight, #1F2937)

---

**Section 3: Settlement Method**

**Heading**: "Settlement Method"

**Radio buttons** (vertical):

1. Option 1:
   - Bank: "Guaranty Trust Bank (GTB)"
   - Account: "\***\* \*\*** \*\*\*\* 5678"
   - Holder: "Chioma Adeyemi"
   - Selected: Yes (by default)

2. Option 2:
   - Button: "+ Add New Account"
   - On click: Form appears for adding new bank account

---

**Section 4: Terms Checkbox**

**Checkbox**:

- Text: "I confirm that the above details are correct and authorize this settlement"
- Font-size: 12px
- Checkbox styling: Standard, styled with TailwindCSS

---

**Section 5: Action Buttons**

**Layout**: 2 buttons, full width

**Button 1**: "Cancel"

- Background: #E5E7EB (light gray)
- Text: #1F2937 (dark)
- Padding: 12px
- Width: 48%
- Border-radius: 4px

**Button 2**: "Settle Now"

- Background: #10B981 (green)
- Text: white
- Padding: 12px
- Width: 48%
- Border-radius: 4px
- Disabled state: If checkbox unchecked
- Loading state: Text changes to "Processing..." with spinner

---

---

# **10. LOADING & SUCCESS STATES**

## **Settlement Loading State**

**Page**: Settlement modal remains visible
**Overlay**: Dark overlay appears (opacity 0.7)
**Spinner**: Centered, blue color
**Text**: "Processing your settlement..." (below spinner)
**Duration**: ~2-3 seconds (animated, not static)

---

## **Settlement Success State**

**Modal transforms to**:

- Heading: "Settlement Successful! ✓"
- Icon: Large green checkmark
- Message: "₦12,450 has been sent to your GTB account"
- Subtext: "Reference: SW-2026-001234"
- Subtext: "You'll see it in your bank within minutes"
- Button: "Back to Dashboard" (blue, full width)

---

## **Settlement Error State**

**Modal transforms to**:

- Heading: "Settlement Failed"
- Icon: Large red X
- Message: "Something went wrong. Please try again"
- Error details: "Bank transfer API timeout" (smaller, gray)
- Buttons: "Retry" (blue) | "Contact Support" (gray outline)

---

---

# **11. NAVIGATION FLOW SUMMARY**

```
Landing Page
    ↓
    ├─→ "Start as Worker" → Signup → Dashboard
    │
    └─→ "Sign In" (if existing) → Login → Dashboard

Dashboard
    ├─→ Earnings (top card)
    ├─→ Settlements
    ├─→ Settings
    └─→ Support

Everywhere:
    ├─→ Can click "Settle Now" → Settlement Modal
    └─→ Can sign out from sidebar
```

---

---

# **COLOR PALETTE (TailwindCSS Colors)**

| Color            | Hex     | Usage                             |
| ---------------- | ------- | --------------------------------- |
| Primary Blue     | #2563EB | CTAs, links, active states        |
| Dark Gray        | #1F2937 | Main text                         |
| Medium Gray      | #6B7280 | Secondary text                    |
| Light Gray       | #E5E7EB | Borders                           |
| Very Light Gray  | #F9FAFB | Backgrounds                       |
| Green (Success)  | #10B981 | Success states, settlement button |
| Red (Error)      | #DC2626 | Errors, delete actions            |
| Yellow (Warning) | #F59E0B | Warnings, pending states          |
| White            | #FFFFFF | Cards, backgrounds                |

---

# **TYPOGRAPHY SCALE**

| Use                  | Size | Weight | Line Height |
| -------------------- | ---- | ------ | ----------- |
| Hero Heading (H1)    | 48px | 700    | 1.2         |
| Page Title           | 32px | 700    | 1.2         |
| Section Heading (H2) | 28px | 700    | 1.3         |
| Subheading           | 20px | 600    | 1.4         |
| Card Heading         | 16px | 600    | 1.4         |
| Body Text            | 16px | 400    | 1.5         |
| Secondary Text       | 14px | 400    | 1.5         |
| Small Text           | 12px | 400    | 1.4         |

---

# **SPACING STANDARD (TailwindCSS)**

- Section padding: 80px (top/bottom)
- Card padding: 24px - 32px
- Input/Button padding: 12px
- Section gap (between cards): 20px - 32px
- Border-radius: 0px (sharp) to 8px (cards)

---

# **UNSPLASH IMAGE QUERIES TO USE**

| Page      | Section        | Query                              |
| --------- | -------------- | ---------------------------------- |
| Landing   | Hero Right     | "delivery worker phone mobile"     |
| Landing   | Problem Story  | "nigerian delivery rider stressed" |
| Landing   | Solution Col 1 | "analytics dashboard mobile"       |
| Landing   | Solution Col 2 | "payment confirmation successful"  |
| Landing   | Solution Col 3 | "diverse workers collaboration"    |
| Landing   | Step 1         | "phone login interface"            |
| Landing   | Step 2         | "mobile app metrics dashboard"     |
| Landing   | Step 3         | "payment success screen mobile"    |
| Landing   | Step 4         | "push notification mobile"         |
| Login     | Right Image    | "delivery worker smiling happy"    |
| Signup    | Right Image    | "gig worker success victory"       |
| Dashboard | (No images)    | N/A                                |

---

# **RESPONSIVE BREAKPOINTS**

- **Mobile**: < 640px (single column everything)
- **Tablet**: 640px - 1024px (2 columns)
- **Desktop**: > 1024px (full multi-column layouts)

On mobile:

- Sidebars collapse to hamburger menu
- 2-column layouts stack vertically
- Images scale appropriately
- Font sizes reduce slightly (16px → 14px for body)

---

**END OF COMPOSITION DOCUMENT**

This detailed composition provides everything needed to build SwiftSettle's UI without writing a single line of code. All layouts, spacing, typography, colors, and image placeholders are specified.
