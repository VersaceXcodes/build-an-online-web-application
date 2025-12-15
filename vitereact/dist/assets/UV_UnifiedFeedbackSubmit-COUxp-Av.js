import { r as reactExports, j as jsxRuntimeExports, y as CircleCheck, d as CircleAlert, a2 as Send } from "./index-1l1MB-L0.js";
import { c as cn, a as cva, B as Button } from "./button-DrjzdI4a.js";
import { L as Label, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, I as Input } from "./select-CKxnxjkL.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent } from "./card-Bv3U-dWi.js";
const Textarea = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[80px] w-full rounded-lg border-2 border-warm-200 bg-white px-3 py-2 text-sm text-warm-900 transition-all duration-200 placeholder:text-warm-400 focus-visible:outline-none focus-visible:border-kake-caramel-400 focus-visible:ring-2 focus-visible:ring-kake-caramel-200 focus-visible:shadow-caramel disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-warm-50 hover:border-warm-300 resize-none",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
const alertVariants = cva(
  "relative w-full rounded-xl border-2 p-4 shadow-soft animate-cream-fade-in [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
  {
    variants: {
      variant: {
        default: "bg-kake-cream-100 border-kake-cream-400 text-kake-chocolate-800 [&>svg]:text-kake-caramel-600",
        destructive: "bg-kake-berry-50 border-kake-berry-300 text-kake-berry-800 [&>svg]:text-kake-berry-600"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
const Alert = reactExports.forwardRef(({ className, variant, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    ref,
    role: "alert",
    className: cn(alertVariants({ variant }), className),
    ...props
  }
));
Alert.displayName = "Alert";
const AlertTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "h5",
  {
    ref,
    className: cn("mb-1 font-bold leading-none tracking-tight", className),
    ...props
  }
));
AlertTitle.displayName = "AlertTitle";
const AlertDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    ref,
    className: cn("text-sm [&_p]:leading-relaxed", className),
    ...props
  }
));
AlertDescription.displayName = "AlertDescription";
function UV_UnifiedFeedbackSubmit() {
  const [formData, setFormData] = reactExports.useState({
    location: "",
    order_id: "",
    category: "",
    subject: "",
    message: ""
  });
  const [orders, setOrders] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [success, setSuccess] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [userRole, setUserRole] = reactExports.useState("");
  reactExports.useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserRole(user.user_type);
      if (user.user_type === "customer") {
        fetchOrders();
      }
    }
  }, []);
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/my-orders-for-feedback", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/unified-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          order_id: formData.order_id || null
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit feedback");
      }
      setSuccess(true);
      setFormData({
        location: "",
        order_id: "",
        category: "",
        subject: "",
        message: ""
      });
      setTimeout(() => setSuccess(false), 5e3);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  const categories = userRole === "customer" ? ["Complaint", "Suggestion", "Compliment", "Product", "Delivery", "Other"] : ["Operations", "Product", "Suggestion", "Complaint", "Other"];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container mx-auto px-4 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-2xl", children: "Submit Feedback" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: userRole === "customer" ? "Help us improve by sharing your experience" : "Report issues, suggest improvements, or share observations" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      success && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { className: "mb-6 bg-green-50 border-green-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-green-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { className: "text-green-800", children: "Thank you! Your feedback has been submitted successfully." })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { variant: "destructive", className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: error })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "location", children: "Location *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: formData.location,
              onValueChange: (value) => setFormData({ ...formData, location: value }),
              required: true,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "location", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select location" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Blanchardstown", children: "Blanchardstown" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Tallaght", children: "Tallaght" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Glasnevin", children: "Glasnevin" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "All", children: "All Locations" })
                ] })
              ]
            }
          )
        ] }),
        userRole === "customer" && orders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "order", children: "Related Order (Optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: formData.order_id,
              onValueChange: (value) => setFormData({ ...formData, order_id: value }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "order", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select an order (optional)" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "None" }),
                  orders.map((order) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: order.order_id, children: [
                    order.order_number,
                    " - ",
                    order.location_name,
                    " - €",
                    order.total_amount.toFixed(2),
                    " ",
                    "(",
                    new Date(order.created_at).toLocaleDateString(),
                    ")"
                  ] }, order.order_id))
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "category", children: "Category *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: formData.category,
              onValueChange: (value) => setFormData({ ...formData, category: value }),
              required: true,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "category", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select category" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: categories.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: cat, children: cat }, cat)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "subject", children: "Subject *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "subject",
              value: formData.subject,
              onChange: (e) => setFormData({ ...formData, subject: e.target.value }),
              placeholder: "Brief summary of your feedback",
              required: true,
              maxLength: 255
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "message", children: "Message *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              id: "message",
              value: formData.message,
              onChange: (e) => setFormData({ ...formData, message: e.target.value }),
              placeholder: "Please provide details...",
              rows: 6,
              required: true,
              maxLength: 5e3
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500 text-right", children: [
            formData.message.length,
            "/5000 characters"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: loading, className: "w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-4 h-4 mr-2" }),
          loading ? "Submitting..." : "Submit Feedback"
        ] })
      ] })
    ] })
  ] }) });
}
export {
  UV_UnifiedFeedbackSubmit as default
};
