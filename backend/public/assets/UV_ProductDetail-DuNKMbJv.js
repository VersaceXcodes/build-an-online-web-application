import { r as reactExports, j as jsxRuntimeExports, R as React, n as ChevronDown, g as useParams, h as useNavigate, o as useQueryClient, u as useAppStore, a as useQuery, p as LoaderCircle, d as CircleAlert, L as Link, k as ChevronRight, q as ChevronLeft, H as Heart, s as Minus, t as Plus, b as axios } from "./index-CwVo5_So.js";
import { u as useMutation } from "./useMutation-HzYQCpti.js";
import { c as createContextScope, u as useControllableState, a as useId, P as Primitive, b as composeEventHandlers, d as useLayoutEffect2 } from "./index-vLnNbD_Y.js";
import { c as createCollection, u as useDirection } from "./index-DXFKvTYN.js";
import { u as useComposedRefs, c as cn } from "./utils-DtpRslYw.js";
import { P as Presence } from "./index-DR6VajYa.js";
var COLLAPSIBLE_NAME = "Collapsible";
var [createCollapsibleContext, createCollapsibleScope] = createContextScope(COLLAPSIBLE_NAME);
var [CollapsibleProvider, useCollapsibleContext] = createCollapsibleContext(COLLAPSIBLE_NAME);
var Collapsible = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeCollapsible,
      open: openProp,
      defaultOpen,
      disabled,
      onOpenChange,
      ...collapsibleProps
    } = props;
    const [open, setOpen] = useControllableState({
      prop: openProp,
      defaultProp: defaultOpen ?? false,
      onChange: onOpenChange,
      caller: COLLAPSIBLE_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      CollapsibleProvider,
      {
        scope: __scopeCollapsible,
        disabled,
        contentId: useId(),
        open,
        onOpenToggle: reactExports.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            "data-state": getState$1(open),
            "data-disabled": disabled ? "" : void 0,
            ...collapsibleProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
Collapsible.displayName = COLLAPSIBLE_NAME;
var TRIGGER_NAME$1 = "CollapsibleTrigger";
var CollapsibleTrigger = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeCollapsible, ...triggerProps } = props;
    const context = useCollapsibleContext(TRIGGER_NAME$1, __scopeCollapsible);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        "aria-controls": context.contentId,
        "aria-expanded": context.open || false,
        "data-state": getState$1(context.open),
        "data-disabled": context.disabled ? "" : void 0,
        disabled: context.disabled,
        ...triggerProps,
        ref: forwardedRef,
        onClick: composeEventHandlers(props.onClick, context.onOpenToggle)
      }
    );
  }
);
CollapsibleTrigger.displayName = TRIGGER_NAME$1;
var CONTENT_NAME$1 = "CollapsibleContent";
var CollapsibleContent = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { forceMount, ...contentProps } = props;
    const context = useCollapsibleContext(CONTENT_NAME$1, props.__scopeCollapsible);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: ({ present }) => /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsibleContentImpl, { ...contentProps, ref: forwardedRef, present }) });
  }
);
CollapsibleContent.displayName = CONTENT_NAME$1;
var CollapsibleContentImpl = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeCollapsible, present, children, ...contentProps } = props;
  const context = useCollapsibleContext(CONTENT_NAME$1, __scopeCollapsible);
  const [isPresent, setIsPresent] = reactExports.useState(present);
  const ref = reactExports.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const heightRef = reactExports.useRef(0);
  const height = heightRef.current;
  const widthRef = reactExports.useRef(0);
  const width = widthRef.current;
  const isOpen = context.open || isPresent;
  const isMountAnimationPreventedRef = reactExports.useRef(isOpen);
  const originalStylesRef = reactExports.useRef(void 0);
  reactExports.useEffect(() => {
    const rAF = requestAnimationFrame(() => isMountAnimationPreventedRef.current = false);
    return () => cancelAnimationFrame(rAF);
  }, []);
  useLayoutEffect2(() => {
    const node = ref.current;
    if (node) {
      originalStylesRef.current = originalStylesRef.current || {
        transitionDuration: node.style.transitionDuration,
        animationName: node.style.animationName
      };
      node.style.transitionDuration = "0s";
      node.style.animationName = "none";
      const rect = node.getBoundingClientRect();
      heightRef.current = rect.height;
      widthRef.current = rect.width;
      if (!isMountAnimationPreventedRef.current) {
        node.style.transitionDuration = originalStylesRef.current.transitionDuration;
        node.style.animationName = originalStylesRef.current.animationName;
      }
      setIsPresent(present);
    }
  }, [context.open, present]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Primitive.div,
    {
      "data-state": getState$1(context.open),
      "data-disabled": context.disabled ? "" : void 0,
      id: context.contentId,
      hidden: !isOpen,
      ...contentProps,
      ref: composedRefs,
      style: {
        [`--radix-collapsible-content-height`]: height ? `${height}px` : void 0,
        [`--radix-collapsible-content-width`]: width ? `${width}px` : void 0,
        ...props.style
      },
      children: isOpen && children
    }
  );
});
function getState$1(open) {
  return open ? "open" : "closed";
}
var Root = Collapsible;
var Trigger = CollapsibleTrigger;
var Content = CollapsibleContent;
var ACCORDION_NAME = "Accordion";
var ACCORDION_KEYS = ["Home", "End", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"];
var [Collection, useCollection, createCollectionScope] = createCollection(ACCORDION_NAME);
var [createAccordionContext] = createContextScope(ACCORDION_NAME, [
  createCollectionScope,
  createCollapsibleScope
]);
var useCollapsibleScope = createCollapsibleScope();
var Accordion$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { type, ...accordionProps } = props;
    const singleProps = accordionProps;
    const multipleProps = accordionProps;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Provider, { scope: props.__scopeAccordion, children: type === "multiple" ? /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionImplMultiple, { ...multipleProps, ref: forwardedRef }) : /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionImplSingle, { ...singleProps, ref: forwardedRef }) });
  }
);
Accordion$1.displayName = ACCORDION_NAME;
var [AccordionValueProvider, useAccordionValueContext] = createAccordionContext(ACCORDION_NAME);
var [AccordionCollapsibleProvider, useAccordionCollapsibleContext] = createAccordionContext(
  ACCORDION_NAME,
  { collapsible: false }
);
var AccordionImplSingle = React.forwardRef(
  (props, forwardedRef) => {
    const {
      value: valueProp,
      defaultValue,
      onValueChange = () => {
      },
      collapsible = false,
      ...accordionSingleProps
    } = props;
    const [value, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue ?? "",
      onChange: onValueChange,
      caller: ACCORDION_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      AccordionValueProvider,
      {
        scope: props.__scopeAccordion,
        value: React.useMemo(() => value ? [value] : [], [value]),
        onItemOpen: setValue,
        onItemClose: React.useCallback(() => collapsible && setValue(""), [collapsible, setValue]),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionCollapsibleProvider, { scope: props.__scopeAccordion, collapsible, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionImpl, { ...accordionSingleProps, ref: forwardedRef }) })
      }
    );
  }
);
var AccordionImplMultiple = React.forwardRef((props, forwardedRef) => {
  const {
    value: valueProp,
    defaultValue,
    onValueChange = () => {
    },
    ...accordionMultipleProps
  } = props;
  const [value, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue ?? [],
    onChange: onValueChange,
    caller: ACCORDION_NAME
  });
  const handleItemOpen = React.useCallback(
    (itemValue) => setValue((prevValue = []) => [...prevValue, itemValue]),
    [setValue]
  );
  const handleItemClose = React.useCallback(
    (itemValue) => setValue((prevValue = []) => prevValue.filter((value2) => value2 !== itemValue)),
    [setValue]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    AccordionValueProvider,
    {
      scope: props.__scopeAccordion,
      value,
      onItemOpen: handleItemOpen,
      onItemClose: handleItemClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionCollapsibleProvider, { scope: props.__scopeAccordion, collapsible: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionImpl, { ...accordionMultipleProps, ref: forwardedRef }) })
    }
  );
});
var [AccordionImplProvider, useAccordionContext] = createAccordionContext(ACCORDION_NAME);
var AccordionImpl = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, disabled, dir, orientation = "vertical", ...accordionProps } = props;
    const accordionRef = React.useRef(null);
    const composedRefs = useComposedRefs(accordionRef, forwardedRef);
    const getItems = useCollection(__scopeAccordion);
    const direction = useDirection(dir);
    const isDirectionLTR = direction === "ltr";
    const handleKeyDown = composeEventHandlers(props.onKeyDown, (event) => {
      var _a;
      if (!ACCORDION_KEYS.includes(event.key)) return;
      const target = event.target;
      const triggerCollection = getItems().filter((item) => {
        var _a2;
        return !((_a2 = item.ref.current) == null ? void 0 : _a2.disabled);
      });
      const triggerIndex = triggerCollection.findIndex((item) => item.ref.current === target);
      const triggerCount = triggerCollection.length;
      if (triggerIndex === -1) return;
      event.preventDefault();
      let nextIndex = triggerIndex;
      const homeIndex = 0;
      const endIndex = triggerCount - 1;
      const moveNext = () => {
        nextIndex = triggerIndex + 1;
        if (nextIndex > endIndex) {
          nextIndex = homeIndex;
        }
      };
      const movePrev = () => {
        nextIndex = triggerIndex - 1;
        if (nextIndex < homeIndex) {
          nextIndex = endIndex;
        }
      };
      switch (event.key) {
        case "Home":
          nextIndex = homeIndex;
          break;
        case "End":
          nextIndex = endIndex;
          break;
        case "ArrowRight":
          if (orientation === "horizontal") {
            if (isDirectionLTR) {
              moveNext();
            } else {
              movePrev();
            }
          }
          break;
        case "ArrowDown":
          if (orientation === "vertical") {
            moveNext();
          }
          break;
        case "ArrowLeft":
          if (orientation === "horizontal") {
            if (isDirectionLTR) {
              movePrev();
            } else {
              moveNext();
            }
          }
          break;
        case "ArrowUp":
          if (orientation === "vertical") {
            movePrev();
          }
          break;
      }
      const clampedIndex = nextIndex % triggerCount;
      (_a = triggerCollection[clampedIndex].ref.current) == null ? void 0 : _a.focus();
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      AccordionImplProvider,
      {
        scope: __scopeAccordion,
        disabled,
        direction: dir,
        orientation,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Slot, { scope: __scopeAccordion, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            ...accordionProps,
            "data-orientation": orientation,
            ref: composedRefs,
            onKeyDown: disabled ? void 0 : handleKeyDown
          }
        ) })
      }
    );
  }
);
var ITEM_NAME = "AccordionItem";
var [AccordionItemProvider, useAccordionItemContext] = createAccordionContext(ITEM_NAME);
var AccordionItem$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, value, ...accordionItemProps } = props;
    const accordionContext = useAccordionContext(ITEM_NAME, __scopeAccordion);
    const valueContext = useAccordionValueContext(ITEM_NAME, __scopeAccordion);
    const collapsibleScope = useCollapsibleScope(__scopeAccordion);
    const triggerId = useId();
    const open = value && valueContext.value.includes(value) || false;
    const disabled = accordionContext.disabled || props.disabled;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      AccordionItemProvider,
      {
        scope: __scopeAccordion,
        open,
        disabled,
        triggerId,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Root,
          {
            "data-orientation": accordionContext.orientation,
            "data-state": getState(open),
            ...collapsibleScope,
            ...accordionItemProps,
            ref: forwardedRef,
            disabled,
            open,
            onOpenChange: (open2) => {
              if (open2) {
                valueContext.onItemOpen(value);
              } else {
                valueContext.onItemClose(value);
              }
            }
          }
        )
      }
    );
  }
);
AccordionItem$1.displayName = ITEM_NAME;
var HEADER_NAME = "AccordionHeader";
var AccordionHeader = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, ...headerProps } = props;
    const accordionContext = useAccordionContext(ACCORDION_NAME, __scopeAccordion);
    const itemContext = useAccordionItemContext(HEADER_NAME, __scopeAccordion);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.h3,
      {
        "data-orientation": accordionContext.orientation,
        "data-state": getState(itemContext.open),
        "data-disabled": itemContext.disabled ? "" : void 0,
        ...headerProps,
        ref: forwardedRef
      }
    );
  }
);
AccordionHeader.displayName = HEADER_NAME;
var TRIGGER_NAME = "AccordionTrigger";
var AccordionTrigger$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, ...triggerProps } = props;
    const accordionContext = useAccordionContext(ACCORDION_NAME, __scopeAccordion);
    const itemContext = useAccordionItemContext(TRIGGER_NAME, __scopeAccordion);
    const collapsibleContext = useAccordionCollapsibleContext(TRIGGER_NAME, __scopeAccordion);
    const collapsibleScope = useCollapsibleScope(__scopeAccordion);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.ItemSlot, { scope: __scopeAccordion, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trigger,
      {
        "aria-disabled": itemContext.open && !collapsibleContext.collapsible || void 0,
        "data-orientation": accordionContext.orientation,
        id: itemContext.triggerId,
        ...collapsibleScope,
        ...triggerProps,
        ref: forwardedRef
      }
    ) });
  }
);
AccordionTrigger$1.displayName = TRIGGER_NAME;
var CONTENT_NAME = "AccordionContent";
var AccordionContent$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, ...contentProps } = props;
    const accordionContext = useAccordionContext(ACCORDION_NAME, __scopeAccordion);
    const itemContext = useAccordionItemContext(CONTENT_NAME, __scopeAccordion);
    const collapsibleScope = useCollapsibleScope(__scopeAccordion);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Content,
      {
        role: "region",
        "aria-labelledby": itemContext.triggerId,
        "data-orientation": accordionContext.orientation,
        ...collapsibleScope,
        ...contentProps,
        ref: forwardedRef,
        style: {
          ["--radix-accordion-content-height"]: "var(--radix-collapsible-content-height)",
          ["--radix-accordion-content-width"]: "var(--radix-collapsible-content-width)",
          ...props.style
        }
      }
    );
  }
);
AccordionContent$1.displayName = CONTENT_NAME;
function getState(open) {
  return open ? "open" : "closed";
}
var Root2 = Accordion$1;
var Item = AccordionItem$1;
var Header = AccordionHeader;
var Trigger2 = AccordionTrigger$1;
var Content2 = AccordionContent$1;
const Accordion = Root2;
const AccordionItem = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Item,
  {
    ref,
    className: cn("border-b", className),
    ...props
  }
));
AccordionItem.displayName = "AccordionItem";
const AccordionTrigger = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Header, { className: "flex", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Trigger2,
  {
    ref,
    className: cn(
      "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 shrink-0 transition-transform duration-200" })
    ]
  }
) }));
AccordionTrigger.displayName = Trigger2.displayName;
const AccordionContent = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    className: "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("pb-4 pt-0", className), children })
  }
));
AccordionContent.displayName = Content2.displayName;
const UV_ProductDetail = () => {
  const { location_name, product_id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAppStore((state) => state.authentication_state.current_user);
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const isAuthenticated = useAppStore((state) => state.authentication_state.authentication_status.is_authenticated);
  const addToCart = useAppStore((state) => state.add_to_cart);
  const showToast = useAppStore((state) => state.show_toast);
  const openCartPanel = useAppStore((state) => state.open_cart_panel);
  const [selectedQuantity, setSelectedQuantity] = reactExports.useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = reactExports.useState(0);
  const [additionalImagesArray, setAdditionalImagesArray] = reactExports.useState([]);
  const [customerName, setCustomerName] = reactExports.useState("");
  const [selectedTopping, setSelectedTopping] = reactExports.useState("");
  const [selectedSauce, setSelectedSauce] = reactExports.useState("");
  const [extraToppings, setExtraToppings] = reactExports.useState([]);
  const [extraSauces, setExtraSauces] = reactExports.useState([]);
  const fetchProductDetails = async (productId) => {
    const response = await axios.get(
      `${"https://123build-an-online-web-application.launchpulse.ai"}/api/products/${productId}`
    );
    return {
      ...response.data,
      category: response.data.category,
      availability_status: response.data.availability_status,
      price: Number(response.data.price || 0),
      compare_at_price: response.data.compare_at_price ? Number(response.data.compare_at_price) : null,
      stock_quantity: response.data.stock_quantity ? Number(response.data.stock_quantity) : null,
      low_stock_threshold: response.data.low_stock_threshold ? Number(response.data.low_stock_threshold) : null
    };
  };
  const { data: product, isLoading: productLoading, error: productError } = useQuery({
    queryKey: ["product", product_id],
    queryFn: () => fetchProductDetails(product_id),
    enabled: !!product_id,
    staleTime: 6e4,
    // 1 minute
    retry: 1
  });
  reactExports.useEffect(() => {
    if (product) {
      if (product.additional_images) {
        try {
          const parsed = JSON.parse(product.additional_images);
          setAdditionalImagesArray(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.error("Failed to parse additional images:", e);
          setAdditionalImagesArray([]);
        }
      } else {
        setAdditionalImagesArray([]);
      }
    }
  }, [product]);
  const dietaryTagsArray = (product == null ? void 0 : product.dietary_tags) ? (() => {
    try {
      return JSON.parse(product.dietary_tags);
    } catch {
      return product.dietary_tags.split(",").map((tag) => tag.trim()).filter(Boolean);
    }
  })() : [];
  const allImages = product ? [product.primary_image_url, ...additionalImagesArray] : [];
  const fetchRelatedProducts = async (category, currentProductId) => {
    const response = await axios.get(
      `${"https://123build-an-online-web-application.launchpulse.ai"}/api/products`,
      {
        params: {
          category,
          availability_status: "in_stock",
          is_archived: false,
          limit: 5,
          // Fetch 5 to filter out current and still have 4
          offset: 0,
          sort_by: "created_at",
          sort_order: "desc"
        }
      }
    );
    const products = response.data.data.map((p) => ({
      ...p,
      category: p.category,
      availability_status: p.availability_status,
      price: Number(p.price || 0),
      compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
      stock_quantity: p.stock_quantity ? Number(p.stock_quantity) : null,
      low_stock_threshold: p.low_stock_threshold ? Number(p.low_stock_threshold) : null
    }));
    return products.filter((p) => p.product_id !== currentProductId).slice(0, 4);
  };
  const { data: relatedProducts = [], isLoading: relatedLoading } = useQuery({
    queryKey: ["related-products", product == null ? void 0 : product.category, product == null ? void 0 : product.product_id],
    queryFn: () => fetchRelatedProducts(product.category, product.product_id),
    enabled: !!product && !!product.category,
    staleTime: 3e5
    // 5 minutes
  });
  const fetchToppings = async () => {
    const response = await axios.get(
      `${"https://123build-an-online-web-application.launchpulse.ai"}/api/toppings`,
      {
        params: {
          is_available: true
        }
      }
    );
    return response.data.map((t) => ({
      ...t,
      price: Number(t.price || 0)
    }));
  };
  const { data: toppingsData = [] } = useQuery({
    queryKey: ["toppings"],
    queryFn: fetchToppings,
    staleTime: 3e5
    // 5 minutes
  });
  const availableToppings = toppingsData.filter((t) => t.topping_type === "topping");
  const availableSauces = toppingsData.filter((t) => t.topping_type === "sauce");
  const fetchFavorites = async () => {
    if (!currentUser) return [];
    const response = await axios.get(
      `${"https://123build-an-online-web-application.launchpulse.ai"}/api/favorites`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    return response.data;
  };
  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites", currentUser == null ? void 0 : currentUser.user_id],
    queryFn: fetchFavorites,
    enabled: isAuthenticated && !!currentUser,
    staleTime: 6e4
  });
  const isFavorited = favorites.some((fav) => fav.product_id === product_id);
  const addFavoriteMutation = useMutation({
    mutationFn: async (productId) => {
      const response = await axios.post(
        `${"https://123build-an-online-web-application.launchpulse.ai"}/api/favorites`,
        {
          product_id: productId
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      return response.data;
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ["favorites", currentUser == null ? void 0 : currentUser.user_id] });
      const previousFavorites = queryClient.getQueryData(["favorites", currentUser == null ? void 0 : currentUser.user_id]);
      queryClient.setQueryData(
        ["favorites", currentUser == null ? void 0 : currentUser.user_id],
        (old) => [
          ...old || [],
          {
            favorite_id: `temp_${Date.now()}`,
            user_id: (currentUser == null ? void 0 : currentUser.user_id) || "",
            product_id: productId,
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          }
        ]
      );
      return { previousFavorites };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["favorites", currentUser == null ? void 0 : currentUser.user_id] });
      await queryClient.refetchQueries({ queryKey: ["favorites", currentUser == null ? void 0 : currentUser.user_id] });
      showToast("success", "Added to favorites");
    },
    onError: (error, _productId, context) => {
      var _a, _b;
      if (context == null ? void 0 : context.previousFavorites) {
        queryClient.setQueryData(["favorites", currentUser == null ? void 0 : currentUser.user_id], context.previousFavorites);
      }
      showToast("error", ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to add favorite");
    }
  });
  const removeFavoriteMutation = useMutation({
    mutationFn: async (favoriteId) => {
      const response = await axios.delete(
        `${"https://123build-an-online-web-application.launchpulse.ai"}/api/favorites/${favoriteId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      return response.data;
    },
    onMutate: async (favoriteId) => {
      await queryClient.cancelQueries({ queryKey: ["favorites", currentUser == null ? void 0 : currentUser.user_id] });
      const previousFavorites = queryClient.getQueryData(["favorites", currentUser == null ? void 0 : currentUser.user_id]);
      queryClient.setQueryData(
        ["favorites", currentUser == null ? void 0 : currentUser.user_id],
        (old) => (old || []).filter((fav) => fav.favorite_id !== favoriteId)
      );
      return { previousFavorites };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["favorites", currentUser == null ? void 0 : currentUser.user_id] });
      await queryClient.refetchQueries({ queryKey: ["favorites", currentUser == null ? void 0 : currentUser.user_id] });
      showToast("info", "Removed from favorites");
    },
    onError: (error, _favoriteId, context) => {
      var _a, _b;
      if (context == null ? void 0 : context.previousFavorites) {
        queryClient.setQueryData(["favorites", currentUser == null ? void 0 : currentUser.user_id], context.previousFavorites);
      }
      showToast("error", ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to remove favorite");
    }
  });
  const handleQuantityChange = (delta) => {
    setSelectedQuantity((prev) => Math.max(1, prev + delta));
  };
  const handleAddToCart = () => {
    var _a, _b;
    if (!product) return;
    if (product.availability_status !== "in_stock") {
      showToast("error", "This product is currently unavailable");
      return;
    }
    if (availableToppings.length > 0 && !selectedTopping) {
      showToast("error", "Please select a topping");
      return;
    }
    if (availableSauces.length > 0 && !selectedSauce) {
      showToast("error", "Please select a sauce");
      return;
    }
    const extraToppingsCost = extraToppings.reduce((sum, id) => {
      const topping = toppingsData.find((t) => t.topping_id === id);
      return sum + ((topping == null ? void 0 : topping.price) || 0);
    }, 0);
    const extraSaucesCost = extraSauces.reduce((sum, id) => {
      const sauce = toppingsData.find((t) => t.topping_id === id);
      return sum + ((sauce == null ? void 0 : sauce.price) || 0);
    }, 0);
    const totalPrice = product.price + extraToppingsCost + extraSaucesCost;
    const cartItem = {
      product_id: product.product_id,
      product_name: product.product_name,
      price: totalPrice,
      quantity: selectedQuantity,
      subtotal: totalPrice * selectedQuantity,
      primary_image_url: product.primary_image_url,
      customer_name: customerName.trim() || void 0,
      selected_toppings: selectedTopping ? [{
        topping_id: selectedTopping,
        topping_name: ((_a = toppingsData.find((t) => t.topping_id === selectedTopping)) == null ? void 0 : _a.topping_name) || "",
        price: 0
        // Base topping is included
      }, ...extraToppings.map((id) => {
        const topping = toppingsData.find((t) => t.topping_id === id);
        return {
          topping_id: id,
          topping_name: (topping == null ? void 0 : topping.topping_name) || "",
          price: (topping == null ? void 0 : topping.price) || 0
        };
      })] : extraToppings.map((id) => {
        const topping = toppingsData.find((t) => t.topping_id === id);
        return {
          topping_id: id,
          topping_name: (topping == null ? void 0 : topping.topping_name) || "",
          price: (topping == null ? void 0 : topping.price) || 0
        };
      }),
      selected_sauces: selectedSauce ? [{
        topping_id: selectedSauce,
        topping_name: ((_b = toppingsData.find((t) => t.topping_id === selectedSauce)) == null ? void 0 : _b.topping_name) || "",
        price: 0
        // Base sauce is included
      }, ...extraSauces.map((id) => {
        const sauce = toppingsData.find((t) => t.topping_id === id);
        return {
          topping_id: id,
          topping_name: (sauce == null ? void 0 : sauce.topping_name) || "",
          price: (sauce == null ? void 0 : sauce.price) || 0
        };
      })] : extraSauces.map((id) => {
        const sauce = toppingsData.find((t) => t.topping_id === id);
        return {
          topping_id: id,
          topping_name: (sauce == null ? void 0 : sauce.topping_name) || "",
          price: (sauce == null ? void 0 : sauce.price) || 0
        };
      })
    };
    addToCart(cartItem);
    setSelectedQuantity(1);
    setCustomerName("");
    setSelectedTopping("");
    setSelectedSauce("");
    setExtraToppings([]);
    setExtraSauces([]);
    setTimeout(() => {
      openCartPanel();
    }, 500);
  };
  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      showToast("info", "Please log in to save favorites");
      navigate("/login");
      return;
    }
    if (addFavoriteMutation.isPending || removeFavoriteMutation.isPending) {
      return;
    }
    const favorite = favorites.find((fav) => fav.product_id === product_id);
    if (favorite) {
      if (!favorite.favorite_id.startsWith("temp_")) {
        removeFavoriteMutation.mutate(favorite.favorite_id);
      }
    } else {
      addFavoriteMutation.mutate(product_id);
    }
  };
  const handleImageSelect = (index) => {
    setSelectedImageIndex(index);
  };
  const handlePreviousImage = () => {
    setSelectedImageIndex(
      (prev) => prev === 0 ? allImages.length - 1 : prev - 1
    );
  };
  const handleNextImage = () => {
    setSelectedImageIndex(
      (prev) => prev === allImages.length - 1 ? 0 : prev + 1
    );
  };
  reactExports.useEffect(() => {
    if (productError) {
      showToast("error", "Product not found");
      navigate(`/location/${location_name}/menu`);
    }
  }, [productError, navigate, location_name, showToast]);
  if (productLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-kake-cream-50 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center min-h-[60vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-12 h-12 text-kake-caramel-500 animate-spin mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-kake-chocolate-500 text-lg", children: "Loading product details..." })
    ] }) }) }) }) });
  }
  if (!product) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-kake-cream-50 py-8 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-16 h-16 text-red-500 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-kake-chocolate-500 mb-2", children: "Product Not Found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-kake-chocolate-500/80 mb-6", children: "The product you're looking for doesn't exist." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: `/location/${location_name}/menu`,
          className: "inline-flex items-center px-6 py-3 gradient-caramel text-white rounded-xl hover:shadow-caramel-lg transition-all",
          children: "Back to Menu"
        }
      )
    ] }) }) });
  }
  const isOutOfStock = product.availability_status !== "in_stock";
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const favoriteLoading = addFavoriteMutation.isPending || removeFavoriteMutation.isPending;
  const dietaryIcons = {
    "vegan": "🌱",
    "vegetarian": "🥬",
    "gluten_free": "🌾",
    "dairy_free": "🥛",
    "nut_free": "🥜",
    "organic": "🌿"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-kake-cream-50 pb-20 lg:pb-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white/80 backdrop-blur-sm border-b border-kake-caramel-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex items-center space-x-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/",
          className: "text-kake-chocolate-500/70 hover:text-kake-chocolate-500 transition-colors",
          children: "Home"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 text-kake-chocolate-500/40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: `/location/${location_name}`,
          className: "text-kake-chocolate-500/70 hover:text-kake-chocolate-500 transition-colors capitalize",
          children: location_name
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 text-kake-chocolate-500/40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: `/location/${location_name}/menu`,
          className: "text-kake-chocolate-500/70 hover:text-kake-chocolate-500 transition-colors",
          children: "Menu"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 text-kake-chocolate-500/40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-kake-chocolate-500 font-medium truncate max-w-xs", children: product.product_name })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative bg-white rounded-xl shadow-soft-lg overflow-hidden aspect-square", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: allImages[selectedImageIndex],
                alt: product.product_name,
                className: "w-full h-full object-cover",
                loading: "lazy"
              }
            ),
            allImages.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: handlePreviousImage,
                  className: "absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-soft transition-all",
                  "aria-label": "Previous image",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-6 h-6 text-kake-chocolate-500" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: handleNextImage,
                  className: "absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-soft transition-all",
                  "aria-label": "Next image",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-6 h-6 text-kake-chocolate-500" })
                }
              )
            ] }),
            product.is_featured && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-4 left-4 gradient-caramel text-white px-3 py-1 rounded-full text-sm font-semibold shadow-caramel", children: "⭐ Featured" }),
            isOutOfStock && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg", children: "Out of Stock" })
          ] }),
          allImages.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 overflow-x-auto pb-2", children: allImages.map((image, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleImageSelect(index),
              className: `flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === index ? "border-kake-caramel-500 ring-2 ring-kake-caramel-500/20" : "border-kake-cream-300 hover:border-kake-cream-400"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: image,
                  alt: `${product.product_name} view ${index + 1}`,
                  className: "w-full h-full object-cover",
                  loading: "lazy"
                }
              )
            },
            index
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-3xl lg:text-4xl font-bold text-kake-chocolate-500 leading-tight mb-3", children: product.product_name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-3 mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-serif text-4xl font-bold text-kake-chocolate-500", children: [
                  "€",
                  product.price.toFixed(2)
                ] }),
                hasDiscount && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-2xl font-medium text-kake-chocolate-500/50 line-through", children: [
                  "€",
                  product.compare_at_price.toFixed(2)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg text-kake-chocolate-500/80 leading-relaxed", children: product.short_description })
            ] }),
            isAuthenticated && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: handleToggleFavorite,
                disabled: favoriteLoading,
                className: "flex-shrink-0 p-3 rounded-full border-2 border-kake-cream-300 hover:border-red-500 hover:bg-red-50 transition-all disabled:opacity-50",
                "aria-label": isFavorited ? "Remove from favorites" : "Add to favorites",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Heart,
                  {
                    className: `w-6 h-6 transition-colors ${isFavorited ? "fill-red-500 text-red-500" : "text-kake-chocolate-500/40"}`
                  }
                )
              }
            )
          ] }),
          dietaryTagsArray.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: dietaryTagsArray.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "span",
            {
              className: "inline-flex items-center gap-1 px-3 py-1.5 border-2 border-kake-caramel-500/30 text-kake-chocolate-500 bg-kake-cream-100 rounded-full text-sm font-medium hover:border-kake-caramel-500 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: dietaryIcons[tag.toLowerCase()] || "✓" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: tag.replace("_", " ") })
              ]
            },
            tag
          )) }),
          product.long_description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "prose prose-blue max-w-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 bg-white rounded-xl shadow-soft border border-kake-caramel-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-kake-chocolate-500/80 leading-relaxed", children: product.long_description }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-3 h-3 rounded-full ${isOutOfStock ? "bg-red-500" : "bg-green-500"}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-medium ${isOutOfStock ? "text-red-700" : "text-green-700"}`, children: isOutOfStock ? "Out of Stock" : "In Stock" }),
            !isOutOfStock && product.stock_quantity && product.low_stock_threshold && product.stock_quantity <= product.low_stock_threshold && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-orange-600 font-medium ml-2", children: [
              "Only ",
              product.stock_quantity,
              " left!"
            ] })
          ] }),
          product.available_for_corporate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 border-2 border-kake-caramel-500/30 bg-kake-cream-100 text-kake-chocolate-500 rounded-lg text-sm font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🎉" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Great for corporate orders" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "customer_name", className: "block text-sm font-semibold text-kake-chocolate-500", children: "Customer Name (Optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                id: "customer_name",
                value: customerName,
                onChange: (e) => setCustomerName(e.target.value),
                placeholder: "Enter name for this item",
                className: "w-full px-4 py-3 border-2 border-kake-cream-300 rounded-lg focus:border-kake-caramel-500 focus:ring-2 focus:ring-kake-caramel-500/20 transition-all",
                disabled: isOutOfStock
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-kake-chocolate-500/70", children: "Perfect for group orders - label each item with a name" })
          ] }),
          availableToppings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-base font-bold text-kake-chocolate-500", children: [
              "Choose Your Topping ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-kake-chocolate-500/70 font-medium", children: "One topping included free with your order" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: availableToppings.map((topping) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setSelectedTopping(topping.topping_id),
                disabled: isOutOfStock,
                className: `px-4 py-3 rounded-xl text-base font-bold border-2 transition-all ${selectedTopping === topping.topping_id ? "border-kake-caramel-500 bg-kake-caramel-500 text-white shadow-caramel scale-105" : "border-kake-cream-300 bg-white text-kake-chocolate-500 hover:border-kake-caramel-500/50"} disabled:opacity-50 disabled:cursor-not-allowed`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedTopping === topping.topping_id ? "border-white" : "border-kake-chocolate-500/30"}`, children: selectedTopping === topping.topping_id && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-white" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: topping.topping_name })
                ] })
              },
              topping.topping_id
            )) })
          ] }) }),
          availableSauces.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-base font-bold text-kake-chocolate-500", children: [
              "Choose Your Sauce ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-kake-chocolate-500/70 font-medium", children: "One sauce included free with your order" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: availableSauces.map((sauce) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setSelectedSauce(sauce.topping_id),
                disabled: isOutOfStock,
                className: `px-4 py-3 rounded-xl text-base font-bold border-2 transition-all ${selectedSauce === sauce.topping_id ? "border-kake-caramel-500 bg-kake-caramel-500 text-white shadow-caramel scale-105" : "border-kake-cream-300 bg-white text-kake-chocolate-500 hover:border-kake-caramel-500/50"} disabled:opacity-50 disabled:cursor-not-allowed`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedSauce === sauce.topping_id ? "border-white" : "border-kake-chocolate-500/30"}`, children: selectedSauce === sauce.topping_id && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-white" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: sauce.topping_name })
                ] })
              },
              sauce.topping_id
            )) })
          ] }) }),
          (availableToppings.length > 0 || availableSauces.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-br from-kake-cream-50 to-kake-cream-100 rounded-xl border-2 border-kake-caramel-500/20 shadow-soft overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Accordion, { type: "single", collapsible: true, defaultValue: "extras", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AccordionItem, { value: "extras", className: "border-none", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionTrigger, { className: "px-5 py-4 hover:no-underline hover:bg-kake-cream-200/50 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold text-kake-chocolate-500", children: "Want more? Add extras" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium px-2 py-1 bg-kake-caramel-500/20 text-kake-caramel-600 rounded-full", children: "Prices shown per item" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionContent, { className: "px-5 pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              availableToppings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-kake-chocolate-500 mb-3", children: "Extra Toppings" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: availableToppings.map((topping) => {
                  const isBaseSelection = selectedTopping === topping.topping_id;
                  const isExtraSelected = extraToppings.includes(topping.topping_id);
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        if (isExtraSelected) {
                          setExtraToppings((prev) => prev.filter((id) => id !== topping.topping_id));
                        } else {
                          setExtraToppings((prev) => [...prev, topping.topping_id]);
                        }
                      },
                      disabled: isOutOfStock || isBaseSelection,
                      className: `w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${isExtraSelected ? "border-green-500 bg-green-500 text-white shadow-md" : isBaseSelection ? "border-kake-cream-300 bg-kake-cream-200 text-kake-chocolate-500/40 cursor-not-allowed" : "border-kake-cream-300 bg-white text-kake-chocolate-500 hover:border-green-500/50 hover:bg-green-50"} disabled:opacity-50`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-3", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${isExtraSelected ? "border-white bg-white" : isBaseSelection ? "border-kake-chocolate-500/20" : "border-kake-chocolate-500/30"}`, children: isExtraSelected && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-500 font-bold text-sm", children: "✓" }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: topping.topping_name }),
                          isBaseSelection && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-0.5 bg-kake-chocolate-500/10 rounded-full", children: "included" })
                        ] }),
                        !isBaseSelection && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-bold px-2 py-1 rounded-full ${isExtraSelected ? "bg-white/20 text-white" : "bg-kake-caramel-500/10 text-kake-caramel-600"}`, children: topping.price === 0 ? "Free" : `+ €${topping.price.toFixed(2)}` })
                      ]
                    },
                    `extra-${topping.topping_id}`
                  );
                }) })
              ] }),
              availableSauces.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-3 border-t border-kake-caramel-500/20", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-kake-chocolate-500 mb-3", children: "Extra Sauces" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: availableSauces.map((sauce) => {
                  const isBaseSelection = selectedSauce === sauce.topping_id;
                  const isExtraSelected = extraSauces.includes(sauce.topping_id);
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        if (isExtraSelected) {
                          setExtraSauces((prev) => prev.filter((id) => id !== sauce.topping_id));
                        } else {
                          setExtraSauces((prev) => [...prev, sauce.topping_id]);
                        }
                      },
                      disabled: isOutOfStock || isBaseSelection,
                      className: `w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${isExtraSelected ? "border-green-500 bg-green-500 text-white shadow-md" : isBaseSelection ? "border-kake-cream-300 bg-kake-cream-200 text-kake-chocolate-500/40 cursor-not-allowed" : "border-kake-cream-300 bg-white text-kake-chocolate-500 hover:border-green-500/50 hover:bg-green-50"} disabled:opacity-50`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-3", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${isExtraSelected ? "border-white bg-white" : isBaseSelection ? "border-kake-chocolate-500/20" : "border-kake-chocolate-500/30"}`, children: isExtraSelected && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-500 font-bold text-sm", children: "✓" }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: sauce.topping_name }),
                          isBaseSelection && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-0.5 bg-kake-chocolate-500/10 rounded-full", children: "included" })
                        ] }),
                        !isBaseSelection && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-bold px-2 py-1 rounded-full ${isExtraSelected ? "bg-white/20 text-white" : "bg-kake-caramel-500/10 text-kake-caramel-600"}`, children: sauce.price === 0 ? "Free" : `+ €${sauce.price.toFixed(2)}` })
                      ]
                    },
                    `extra-${sauce.topping_id}`
                  );
                }) })
              ] })
            ] }) })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-kake-chocolate-500", children: "Quantity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center border-2 border-kake-cream-300 rounded-lg overflow-hidden", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => handleQuantityChange(-1),
                    disabled: selectedQuantity <= 1 || isOutOfStock,
                    className: "px-4 py-3 bg-kake-cream-100 hover:bg-kake-cream-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                    "aria-label": "Decrease quantity",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "w-5 h-5 text-kake-chocolate-500" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-6 py-3 text-xl font-bold text-kake-chocolate-500 min-w-[60px] text-center", children: selectedQuantity }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => handleQuantityChange(1),
                    disabled: isOutOfStock,
                    className: "px-4 py-3 bg-kake-cream-100 hover:bg-kake-cream-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                    "aria-label": "Increase quantity",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-5 h-5 text-kake-chocolate-500" })
                  }
                )
              ] }),
              !isOutOfStock && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-kake-chocolate-500/70 text-sm", children: [
                "Total: ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-kake-chocolate-500", children: [
                  "€",
                  (() => {
                    const extraToppingsCost = extraToppings.reduce((sum, id) => {
                      const topping = toppingsData.find((t) => t.topping_id === id);
                      return sum + ((topping == null ? void 0 : topping.price) || 0);
                    }, 0);
                    const extraSaucesCost = extraSauces.reduce((sum, id) => {
                      const sauce = toppingsData.find((t) => t.topping_id === id);
                      return sum + ((sauce == null ? void 0 : sauce.price) || 0);
                    }, 0);
                    return ((product.price + extraToppingsCost + extraSaucesCost) * selectedQuantity).toFixed(2);
                  })()
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden lg:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleAddToCart,
              disabled: isOutOfStock,
              className: `w-full py-4 px-6 rounded-xl font-bold text-lg shadow-caramel transition-all duration-200 ${isOutOfStock ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "gradient-caramel text-white hover:shadow-caramel-lg hover:scale-105 glow-on-hover"}`,
              children: isOutOfStock ? "Out of Stock" : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Add to Cart" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm opacity-90", children: [
                  "€",
                  (() => {
                    const extraToppingsCost = extraToppings.reduce((sum, id) => {
                      const topping = toppingsData.find((t) => t.topping_id === id);
                      return sum + ((topping == null ? void 0 : topping.price) || 0);
                    }, 0);
                    const extraSaucesCost = extraSauces.reduce((sum, id) => {
                      const sauce = toppingsData.find((t) => t.topping_id === id);
                      return sum + ((sauce == null ? void 0 : sauce.price) || 0);
                    }, 0);
                    return ((product.price + extraToppingsCost + extraSaucesCost) * selectedQuantity).toFixed(2);
                  })()
                ] })
              ] })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 pt-4 border-t border-kake-caramel-500/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-kake-chocolate-500/70 mb-1", children: "Category" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-kake-chocolate-500 capitalize", children: product.category })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-kake-chocolate-500/70 mb-1", children: "Ready In" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-kake-chocolate-500", children: "20-30 minutes" })
            ] })
          ] })
        ] })
      ] }),
      relatedProducts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-16", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-2xl lg:text-3xl font-bold text-kake-chocolate-500 mb-6", children: "You Might Also Like" }),
        relatedLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-8 h-8 text-kake-caramel-500 animate-spin" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6", children: relatedProducts.map((relatedProduct) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: `/location/${location_name}/product/${relatedProduct.product_id}`,
            className: "group bg-white rounded-xl shadow-soft border border-kake-caramel-500/20 hover:shadow-soft-lg hover:border-kake-caramel-500 overflow-hidden transition-all duration-200 hover:scale-105",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: relatedProduct.primary_image_url,
                  alt: relatedProduct.product_name,
                  className: "w-full h-full object-cover group-hover:scale-110 transition-transform duration-300",
                  loading: "lazy"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-kake-chocolate-500 mb-1 line-clamp-1", children: relatedProduct.product_name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-kake-chocolate-500/70 mb-2 line-clamp-2", children: relatedProduct.short_description }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-serif text-lg font-bold text-kake-caramel-500", children: [
                  "€",
                  relatedProduct.price.toFixed(2)
                ] })
              ] })
            ]
          },
          relatedProduct.product_id
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-kake-caramel-500/20 shadow-2xl z-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center border-2 border-kake-cream-300 rounded-lg overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => handleQuantityChange(-1),
            disabled: selectedQuantity <= 1 || isOutOfStock,
            className: "px-3 py-2 bg-kake-cream-100 hover:bg-kake-cream-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
            "aria-label": "Decrease quantity",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "w-4 h-4 text-kake-chocolate-500" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-4 py-2 text-lg font-bold text-kake-chocolate-500 min-w-[50px] text-center", children: selectedQuantity }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => handleQuantityChange(1),
            disabled: isOutOfStock,
            className: "px-3 py-2 bg-kake-cream-100 hover:bg-kake-cream-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
            "aria-label": "Increase quantity",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 text-kake-chocolate-500" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleAddToCart,
          disabled: isOutOfStock,
          className: `flex-1 py-3 px-6 rounded-xl font-bold text-base shadow-caramel transition-all ${isOutOfStock ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "gradient-caramel text-white hover:shadow-caramel-lg active:scale-95"}`,
          children: isOutOfStock ? "Out of Stock" : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Add to Cart" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
              "€",
              (() => {
                const extraToppingsCost = extraToppings.reduce((sum, id) => {
                  const topping = toppingsData.find((t) => t.topping_id === id);
                  return sum + ((topping == null ? void 0 : topping.price) || 0);
                }, 0);
                const extraSaucesCost = extraSauces.reduce((sum, id) => {
                  const sauce = toppingsData.find((t) => t.topping_id === id);
                  return sum + ((sauce == null ? void 0 : sauce.price) || 0);
                }, 0);
                return ((product.price + extraToppingsCost + extraSaucesCost) * selectedQuantity).toFixed(2);
              })()
            ] })
          ] })
        }
      )
    ] }) }) })
  ] }) });
};
export {
  UV_ProductDetail as default
};
