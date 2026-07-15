import { TourStep } from "../types";

export const financeTour: TourStep[] = [
  {
    selector: "#tour-pos-terminal",
    title: "POS Terminal",
    content: "Add services and retail products to the cart. Use the patient search bar at the top to associate the sale with a patient profile.",
    position: "bottom",
    targetScreen: "pos",
    targetTab: "pos"
  },
  {
    selector: "#tour-pos-add-service",
    title: "Add Services & Products",
    content: "Pick services or commercial products to add them to the cart. Each line shows quantity, unit price and subtotal before tax.",
    position: "right",
    targetScreen: "pos",
    targetTab: "pos"
  },
  {
    selector: "#tour-pos-patient-search",
    title: "Associate a Patient",
    content: "Search and link the patient receiving the treatment. The linked profile is required to track clinical history and commissions.",
    position: "bottom",
    targetScreen: "pos",
    targetTab: "pos"
  },
  {
    selector: "#tour-pos-coupons",
    title: "Coupons & Discounts",
    content: "Apply promotional coupons from active campaigns, add manual discounts, and choose between an internal control receipt or a fiscal invoice.",
    position: "left",
    targetScreen: "pos",
    targetTab: "pos"
  },
  {
    selector: "#tour-pos-payment-method",
    title: "Payment Method",
    content: "Choose how the customer pays: CASH (EFECTIVO), CARD (TARJETA), BANK TRANSFER (TRANSFERENCIA), or DIGITAL WALLET (BILLETERA_VIRTUAL). Add a reference number when required.",
    position: "top",
    targetScreen: "pos",
    targetTab: "pos"
  },
  {
    selector: "#tour-pos-submit-sale",
    title: "Generate Receipt",
    content: "Confirm the sale to generate the receipt. The transaction is recorded against the active cash register and posts commissions to the responsible professional.",
    position: "top",
    targetScreen: "pos",
    targetTab: "pos"
  },
  {
    selector: "#tour-caja-chica",
    title: "Cash Register (Caja Chica)",
    content: "Open the cash register with the day's initial balance. Record quick cash expenses for minor outlays and run the end-of-day reconciliation (arqueo).",
    position: "top",
    targetScreen: "pos",
    targetTab: "caja"
  },
  {
    selector: "#tour-cash-initial-balance",
    title: "Open Register",
    content: "Set the opening balance for the day. The system tracks every income and expense so the expected cash matches the actual count at closing.",
    position: "bottom",
    targetScreen: "pos",
    targetTab: "caja"
  },
  {
    selector: "#tour-cash-expense-btn",
    title: "Record Expenses",
    content: "Log cash outflows with a description, amount, and optional receipt. All movements are stored in the register's audit trail.",
    position: "left",
    targetScreen: "pos",
    targetTab: "caja"
  },
  {
    selector: "#tour-cash-close-btn",
    title: "Close with Arqueo",
    content: "Count the physical cash, enter the counted total, and close the register. Any discrepancy against the expected balance is flagged for review.",
    position: "left",
    targetScreen: "pos",
    targetTab: "caja"
  },
  {
    selector: "#tour-schedules",
    title: "Working Schedules",
    content: "Select a professional, toggle the days they work, and set the start and end time for each shift. Save to publish the weekly availability.",
    position: "bottom",
    targetScreen: "pos",
    targetTab: "schedules"
  },
  {
    selector: "#tour-performance",
    title: "Commissions & Targets",
    content: "Review staff commissions, recalculate accruals, and set monthly sales targets together with commission rates per service category.",
    position: "top",
    targetScreen: "pos",
    targetTab: "performance"
  },
  {
    selector: "#tour-payroll",
    title: "Payroll",
    content: "Create a payroll entry that combines the base salary plus the commissions earned minus deductions plus bonuses. Confirm payment to mark the period as settled.",
    position: "top",
    targetScreen: "pos",
    targetTab: "payroll"
  },
  {
    selector: "#tour-promotions",
    title: "Promotions & Coupons",
    content: "Create campaigns with a name, target service, discount percentage, and validity dates. Issue coupons with a code, type, expiry, usage stock, and minimum purchase.",
    position: "top",
    targetScreen: "pos",
    targetTab: "promotions"
  },
  {
    selector: "#tour-attendance",
    title: "Attendance Log",
    content: "Browse the attendance history: check-in and check-out records for every staff member over the selected period.",
    position: "top",
    targetScreen: "pos",
    targetTab: "attendance"
  }
];
