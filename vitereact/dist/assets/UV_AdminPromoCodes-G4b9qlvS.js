import { r as reactExports, j as jsxRuntimeExports, X, u as useAppStore, o as useQueryClient, a as useQuery, aN as Ticket, t as Plus, a5 as Search, d as CircleAlert, aJ as Percent, aj as DollarSign, z as Check, aK as SquarePen, a0 as Trash2, b as axios } from "./index-BU6_V1I5.js";
import { u as useMutation } from "./useMutation-oexYD0Jy.js";
import { c as cva, B as Button } from "./button-CunN5QwN.js";
import { I as Input, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, L as Label } from "./select-BT9diajB.js";
import { c as cn } from "./utils-DL4harQt.js";
import { R as Root, P as Portal, b as Content, C as Close, a as Title, D as Description, O as Overlay } from "./index-BDJowwEI.js";
import "./index-CrEQEmTZ.js";
import "./index-BA8R6CBq.js";
import "./index-DB8nLaPh.js";
import "./index-dBPyfT2m.js";
const Table = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full overflow-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  "table",
  {
    ref,
    className: cn("w-full caption-bottom text-sm", className),
    ...props
  }
) }));
Table.displayName = "Table";
const TableHeader = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { ref, className: cn("[&_tr]:border-b", className), ...props }));
TableHeader.displayName = "TableHeader";
const TableBody = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "tbody",
  {
    ref,
    className: cn("[&_tr:last-child]:border-0", className),
    ...props
  }
));
TableBody.displayName = "TableBody";
const TableFooter = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "tfoot",
  {
    ref,
    className: cn(
      "border-t bg-neutral-100/50 font-medium [&>tr]:last:border-b-0 dark:bg-neutral-800/50",
      className
    ),
    ...props
  }
));
TableFooter.displayName = "TableFooter";
const TableRow = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "tr",
  {
    ref,
    className: cn(
      "border-b transition-colors hover:bg-neutral-100/50 data-[state=selected]:bg-neutral-100 dark:hover:bg-neutral-800/50 dark:data-[state=selected]:bg-neutral-800",
      className
    ),
    ...props
  }
));
TableRow.displayName = "TableRow";
const TableHead = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "th",
  {
    ref,
    className: cn(
      "h-12 px-4 text-left align-middle font-medium text-neutral-500 [&:has([role=checkbox])]:pr-0 dark:text-neutral-400",
      className
    ),
    ...props
  }
));
TableHead.displayName = "TableHead";
const TableCell = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "td",
  {
    ref,
    className: cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className),
    ...props
  }
));
TableCell.displayName = "TableCell";
const TableCaption = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "caption",
  {
    ref,
    className: cn(
      "mt-4 text-sm text-neutral-500 dark:text-neutral-400",
      className
    ),
    ...props
  }
));
TableCaption.displayName = "TableCaption";
const Sheet = Root;
const SheetPortal = Portal;
const SheetOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
SheetOverlay.displayName = Overlay.displayName;
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-white p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 dark:bg-neutral-950",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
const SheetContent = reactExports.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(SheetOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Content,
    {
      ref,
      className: cn(sheetVariants({ side }), className),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-neutral-100 dark:ring-offset-neutral-950 dark:focus:ring-neutral-300 dark:data-[state=open]:bg-neutral-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
SheetContent.displayName = Content.displayName;
const SheetHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
    ...props
  }
);
SheetHeader.displayName = "SheetHeader";
const SheetFooter = ({
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    ),
    ...props
  }
);
SheetFooter.displayName = "SheetFooter";
const SheetTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title,
  {
    ref,
    className: cn(
      "text-lg font-semibold text-neutral-950 dark:text-neutral-50",
      className
    ),
    ...props
  }
));
SheetTitle.displayName = Title.displayName;
const SheetDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description,
  {
    ref,
    className: cn("text-sm text-neutral-500 dark:text-neutral-400", className),
    ...props
  }
));
SheetDescription.displayName = Description.displayName;
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-kake-caramel-400 focus:ring-offset-2 shadow-soft",
  {
    variants: {
      variant: {
        default: "border-transparent gradient-caramel text-white hover:shadow-caramel",
        secondary: "border-transparent bg-kake-cream-400 text-kake-chocolate-700 hover:bg-kake-cream-500",
        destructive: "border-transparent bg-kake-berry-500 text-white hover:bg-kake-berry-600",
        outline: "border-kake-caramel-400 text-kake-caramel-700 bg-white hover:bg-kake-cream-100"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
const fetchPromoCodes = async (token, query, discount_type, is_active, limit, offset) => {
  const params = { limit, offset };
  if (query) params.query = query;
  if (discount_type && discount_type !== "all") params.discount_type = discount_type;
  if (is_active && is_active !== "all") params.is_active = is_active;
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/promo-codes`,
    {
      params,
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
const createPromoCode = async (token, data) => {
  const response = await axios.post(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/promo-codes`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
const deletePromoCode = async (token, codeId) => {
  await axios.delete(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/promo-codes/${codeId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
};
const UV_AdminPromoCodes = () => {
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const showToast = useAppStore((state) => state.show_toast);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [discountTypeFilter, setDiscountTypeFilter] = reactExports.useState("all");
  const [activeFilter, setActiveFilter] = reactExports.useState("all");
  const [page, setPage] = reactExports.useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = reactExports.useState(false);
  const [newPromo, setNewPromo] = reactExports.useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    minimum_order_value: "",
    valid_from: "",
    valid_until: "",
    usage_limit: "",
    is_single_use: false,
    is_active: true
  });
  const limit = 20;
  const queryClient = useQueryClient();
  const {
    data: promoData,
    isLoading,
    error
  } = useQuery({
    queryKey: ["promo-codes", searchQuery, discountTypeFilter, activeFilter, page],
    queryFn: () => fetchPromoCodes(
      authToken,
      searchQuery,
      discountTypeFilter,
      activeFilter,
      limit,
      page * limit
    ),
    enabled: !!authToken,
    staleTime: 3e4
  });
  const createMutation = useMutation({
    mutationFn: (data) => createPromoCode(authToken, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
      showToast("success", "Promo code created successfully");
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error2) => {
      var _a, _b;
      showToast("error", ((_b = (_a = error2.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to create promo code");
    }
  });
  const deleteMutation = useMutation({
    mutationFn: (codeId) => deletePromoCode(authToken, codeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
      showToast("success", "Promo code deleted successfully");
    },
    onError: (error2) => {
      var _a, _b;
      showToast("error", ((_b = (_a = error2.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to delete promo code");
    }
  });
  const handleCreatePromo = async () => {
    if (!newPromo.code.trim()) {
      showToast("error", "Please enter a promo code");
      return;
    }
    if (!newPromo.discount_value || parseFloat(newPromo.discount_value) <= 0) {
      showToast("error", "Please enter a valid discount value");
      return;
    }
    if (!newPromo.valid_from || !newPromo.valid_until) {
      showToast("error", "Please select valid from and until dates");
      return;
    }
    const fromDate = new Date(newPromo.valid_from);
    const untilDate = new Date(newPromo.valid_until);
    if (untilDate < fromDate) {
      showToast("error", "Valid until date must be after valid from date");
      return;
    }
    const promoData2 = {
      code: newPromo.code.toUpperCase().trim(),
      discount_type: newPromo.discount_type,
      discount_value: parseFloat(newPromo.discount_value),
      minimum_order_value: newPromo.minimum_order_value ? parseFloat(newPromo.minimum_order_value) : null,
      valid_from: newPromo.valid_from,
      valid_until: newPromo.valid_until,
      usage_limit: newPromo.usage_limit ? parseInt(newPromo.usage_limit) : null,
      is_single_use: newPromo.is_single_use,
      is_active: newPromo.is_active,
      applicable_locations: null,
      applicable_products: null
    };
    createMutation.mutate(promoData2);
  };
  const handleDeletePromo = async (codeId, code) => {
    if (window.confirm(`Are you sure you want to delete the promo code "${code}"?`)) {
      deleteMutation.mutate(codeId);
    }
  };
  const resetForm = () => {
    setNewPromo({
      code: "",
      discount_type: "percentage",
      discount_value: "",
      minimum_order_value: "",
      valid_from: "",
      valid_until: "",
      usage_limit: "",
      is_single_use: false,
      is_active: true
    });
  };
  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR"
    }).format(parseFloat(amount));
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IE", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white shadow-sm border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl font-bold text-gray-900 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Ticket, { className: "h-8 w-8 text-purple-600" }),
            "Promo Codes Management"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-gray-600", children: "Create and manage promotional discount codes for your customers" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: () => setIsCreateDialogOpen(true),
            className: "bg-purple-600 hover:bg-purple-700",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
              "Create Promo Code"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid grid-cols-1 md:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "text",
              placeholder: "Search by code...",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              className: "pl-10"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: discountTypeFilter, onValueChange: setDiscountTypeFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Discount Types" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Types" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "percentage", children: "Percentage" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fixed", children: "Fixed Amount" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: activeFilter, onValueChange: setActiveFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Status" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "true", children: "Active" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "false", children: "Inactive" })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-5 w-5 text-red-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-700", children: "Failed to load promo codes. Please try again." }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Code" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Discount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Min. Order" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Valid Period" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Usage" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: isLoading ? Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 bg-gray-200 rounded animate-pulse" }) }) }, i)) : (promoData == null ? void 0 : promoData.data.length) === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { colSpan: 7, className: "text-center py-12", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Ticket, { className: "h-12 w-12 text-gray-400 mx-auto mb-3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "No promo codes found" })
          ] }) }) : promoData == null ? void 0 : promoData.data.map((promo) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono font-semibold text-purple-600", children: promo.code }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1", children: promo.discount_type === "percentage" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Percent, { className: "h-4 w-4 text-green-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                promo.discount_value,
                "%"
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4 text-green-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(promo.discount_value) })
            ] }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatCurrency(promo.minimum_order_value) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: formatDate(promo.valid_from) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-gray-500", children: [
                "to ",
                formatDate(promo.valid_until)
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: promo.times_used }),
              promo.usage_limit && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-500", children: [
                " / ",
                promo.usage_limit
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: promo.is_active ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-green-100 text-green-800 hover:bg-green-100", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3 mr-1" }),
              "Active"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-gray-100 text-gray-800 hover:bg-gray-100", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3 mr-1" }),
              "Inactive"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  className: "text-red-600 hover:text-red-700 hover:bg-red-50",
                  onClick: () => handleDeletePromo(promo.code_id, promo.code),
                  disabled: deleteMutation.isPending,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                }
              )
            ] }) })
          ] }, promo.code_id)) })
        ] }),
        promoData && promoData.total > limit && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4 border-t border-gray-200 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-gray-600", children: [
            "Showing ",
            page * limit + 1,
            " to ",
            Math.min((page + 1) * limit, promoData.total),
            " of",
            " ",
            promoData.total,
            " promo codes"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: () => setPage(page - 1),
                disabled: page === 0,
                children: "Previous"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: () => setPage(page + 1),
                disabled: !promoData.has_more,
                children: "Next"
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: isCreateDialogOpen, onOpenChange: setIsCreateDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { className: "sm:max-w-[600px] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: "Create New Promo Code" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SheetDescription, { children: "Create a new promotional discount code for your customers." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "code", children: "Promo Code *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "code",
                placeholder: "SUMMER2024",
                value: newPromo.code,
                onChange: (e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "discount_type", children: "Discount Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: newPromo.discount_type,
                onValueChange: (value) => setNewPromo({ ...newPromo, discount_type: value }),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "percentage", children: "Percentage (%)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fixed", children: "Fixed Amount (€)" })
                  ] })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "discount_value", children: [
              "Discount Value * ",
              newPromo.discount_type === "percentage" ? "(%)" : "(€)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "discount_value",
                type: "number",
                min: "0",
                step: newPromo.discount_type === "percentage" ? "1" : "0.01",
                placeholder: newPromo.discount_type === "percentage" ? "10" : "5.00",
                value: newPromo.discount_value,
                onChange: (e) => setNewPromo({ ...newPromo, discount_value: e.target.value })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "minimum_order_value", children: "Minimum Order (€)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "minimum_order_value",
                type: "number",
                min: "0",
                step: "0.01",
                placeholder: "25.00",
                value: newPromo.minimum_order_value,
                onChange: (e) => setNewPromo({ ...newPromo, minimum_order_value: e.target.value })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "valid_from", children: "Valid From * (YYYY-MM-DD)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "valid_from",
                type: "date",
                value: newPromo.valid_from,
                onChange: (e) => setNewPromo({ ...newPromo, valid_from: e.target.value }),
                min: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
                className: "cursor-pointer",
                onClick: (e) => {
                  const target = e.target;
                  if (target.showPicker) {
                    try {
                      target.showPicker();
                    } catch (err) {
                    }
                  }
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "valid_until", children: "Valid Until * (YYYY-MM-DD)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "valid_until",
                type: "date",
                value: newPromo.valid_until,
                onChange: (e) => setNewPromo({ ...newPromo, valid_until: e.target.value }),
                min: newPromo.valid_from || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
                className: "cursor-pointer",
                onClick: (e) => {
                  const target = e.target;
                  if (target.showPicker) {
                    try {
                      target.showPicker();
                    } catch (err) {
                    }
                  }
                }
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "usage_limit", children: "Usage Limit (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "usage_limit",
              type: "number",
              min: "0",
              placeholder: "Leave empty for unlimited",
              value: newPromo.usage_limit,
              onChange: (e) => setNewPromo({ ...newPromo, usage_limit: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              id: "is_active",
              checked: newPromo.is_active,
              onChange: (e) => setNewPromo({ ...newPromo, is_active: e.target.checked }),
              className: "h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "is_active", className: "font-normal", children: "Activate immediately" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetFooter, { className: "mt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setIsCreateDialogOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleCreatePromo,
            disabled: createMutation.isPending,
            className: "bg-purple-600 hover:bg-purple-700",
            children: createMutation.isPending ? "Creating..." : "Create Promo Code"
          }
        )
      ] })
    ] }) })
  ] });
};
export {
  UV_AdminPromoCodes as default
};
