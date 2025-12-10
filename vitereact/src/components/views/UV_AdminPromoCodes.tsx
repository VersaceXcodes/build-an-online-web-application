import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import {
  Plus,
  Search,
  Ticket,
  DollarSign,
  Percent,
  AlertCircle,
  Check,
  X,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface PromoCode {
  code_id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  minimum_order_value: string | null;
  valid_from: string;
  valid_until: string;
  usage_limit: number | null;
  is_single_use: boolean;
  times_used: number;
  applicable_locations: string[] | null;
  applicable_products: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PromoCodesResponse {
  data: PromoCode[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchPromoCodes = async (
  token: string,
  query: string,
  discount_type: string,
  is_active: string,
  limit: number,
  offset: number
): Promise<PromoCodesResponse> => {
  const params: any = { limit, offset };
  if (query) params.query = query;
  if (discount_type && discount_type !== 'all') params.discount_type = discount_type;
  if (is_active && is_active !== 'all') params.is_active = is_active;

  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/promo-codes`,
    {
      params,
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.data;
};

const createPromoCode = async (token: string, data: any): Promise<PromoCode> => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/promo-codes`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.data;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_AdminPromoCodes: React.FC = () => {
  // ==================================
  // ZUSTAND STATE ACCESS
  // ==================================

  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const showToast = useAppStore(state => state.show_toast);

  // ==================================
  // LOCAL STATE
  // ==================================

  const [searchQuery, setSearchQuery] = useState('');
  const [discountTypeFilter, setDiscountTypeFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Form state
  const [newPromo, setNewPromo] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    minimum_order_value: '',
    valid_from: '',
    valid_until: '',
    usage_limit: '',
    is_single_use: false,
    is_active: true,
  });

  const limit = 20;
  const queryClient = useQueryClient();

  // ==================================
  // REACT QUERY
  // ==================================

  const {
    isLoading,
    error,
  } = useQuery({
    queryKey: ['promo-codes', searchQuery, discountTypeFilter, activeFilter, page],
    queryFn: () =>
      fetchPromoCodes(
        authToken!,
        searchQuery,
        discountTypeFilter,
        activeFilter,
        limit,
        page * limit
      ),
    enabled: !!authToken,
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createPromoCode(authToken!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      showToast('success', 'Promo code created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to create promo code');
    },
  });

  // ==================================
  // EVENT HANDLERS
  // ==================================

  const handleCreatePromo = async () => {
    // Validation
    if (!newPromo.code.trim()) {
      showToast('error', 'Please enter a promo code');
      return;
    }
    if (!newPromo.discount_value || parseFloat(newPromo.discount_value) <= 0) {
      showToast('error', 'Please enter a valid discount value');
      return;
    }
    if (!newPromo.valid_from || !newPromo.valid_until) {
      showToast('error', 'Please select valid from and until dates');
      return;
    }

    const promoData: any = {
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
      applicable_products: null,
    };

    createMutation.mutate(promoData);
  };

  const resetForm = () => {
    setNewPromo({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      minimum_order_value: '',
      valid_from: '',
      valid_until: '',
      usage_limit: '',
      is_single_use: false,
      is_active: true,
    });
  };

  const formatCurrency = (amount: string | null): string => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ==================================
  // RENDER
  // ==================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Ticket className="h-8 w-8 text-purple-600" />
                Promo Codes Management
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Create and manage promotional discount codes for your customers
              </p>
            </div>

            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Promo Code
            </Button>
          </div>

          {/* Filters */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={discountTypeFilter} onValueChange={setDiscountTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Discount Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>

            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Failed to load promo codes. Please try again.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Promo Codes Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min. Order</TableHead>
                <TableHead>Valid Period</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : promoData?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No promo codes found</p>
                  </TableCell>
                </TableRow>
              ) : (
                promoData?.data.map((promo) => (
                  <TableRow key={promo.code_id}>
                    <TableCell className="font-mono font-semibold text-purple-600">
                      {promo.code}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {promo.discount_type === 'percentage' ? (
                          <>
                            <Percent className="h-4 w-4 text-green-600" />
                            <span>{promo.discount_value}%</span>
                          </>
                        ) : (
                          <>
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span>{formatCurrency(promo.discount_value)}</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(promo.minimum_order_value)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(promo.valid_from)}</div>
                        <div className="text-gray-500">to {formatDate(promo.valid_until)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-semibold">{promo.times_used}</span>
                        {promo.usage_limit && (
                          <span className="text-gray-500"> / {promo.usage_limit}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {promo.is_active ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <Check className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                          <X className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {promoData && promoData.total > limit && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {page * limit + 1} to {Math.min((page + 1) * limit, promoData.total)} of{' '}
                {promoData.total} promo codes
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!promoData.has_more}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Promo Code Sheet */}
      <Sheet open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <SheetContent className="sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create New Promo Code</SheetTitle>
            <SheetDescription>
              Create a new promotional discount code for your customers.
            </SheetDescription>
          </SheetHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Promo Code *</Label>
                <Input
                  id="code"
                  placeholder="SUMMER2024"
                  value={newPromo.code}
                  onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_type">Discount Type *</Label>
                <Select
                  value={newPromo.discount_type}
                  onValueChange={(value: 'percentage' | 'fixed') =>
                    setNewPromo({ ...newPromo, discount_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  Discount Value * {newPromo.discount_type === 'percentage' ? '(%)' : '(€)'}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  min="0"
                  step={newPromo.discount_type === 'percentage' ? '1' : '0.01'}
                  placeholder={newPromo.discount_type === 'percentage' ? '10' : '5.00'}
                  value={newPromo.discount_value}
                  onChange={(e) => setNewPromo({ ...newPromo, discount_value: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimum_order_value">Minimum Order (€)</Label>
                <Input
                  id="minimum_order_value"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="25.00"
                  value={newPromo.minimum_order_value}
                  onChange={(e) => setNewPromo({ ...newPromo, minimum_order_value: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valid_from">Valid From *</Label>
                <Input
                  id="valid_from"
                  type="date"
                  value={newPromo.valid_from}
                  onChange={(e) => setNewPromo({ ...newPromo, valid_from: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valid_until">Valid Until *</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={newPromo.valid_until}
                  onChange={(e) => setNewPromo({ ...newPromo, valid_until: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="usage_limit">Usage Limit (optional)</Label>
              <Input
                id="usage_limit"
                type="number"
                min="0"
                placeholder="Leave empty for unlimited"
                value={newPromo.usage_limit}
                onChange={(e) => setNewPromo({ ...newPromo, usage_limit: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={newPromo.is_active}
                onChange={(e) => setNewPromo({ ...newPromo, is_active: e.target.checked })}
                className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <Label htmlFor="is_active" className="font-normal">
                Activate immediately
              </Label>
            </div>
          </div>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreatePromo}
              disabled={createMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Promo Code'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default UV_AdminPromoCodes;
