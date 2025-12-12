import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Order {
  order_id: string;
  order_number: string;
  location_name: string;
  total_amount: number;
  created_at: string;
}

export default function UV_UnifiedFeedbackSubmit() {
  const [formData, setFormData] = useState({
    location: '',
    order_id: '',
    category: '',
    subject: '',
    message: '',
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Get user role from stored data
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserRole(user.user_type);
      
      // If customer, fetch their recent orders
      if (user.user_type === 'customer') {
        fetchOrders();
      }
    }
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/my-orders-for-feedback', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/unified-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          order_id: formData.order_id || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit feedback');
      }

      setSuccess(true);
      setFormData({
        location: '',
        order_id: '',
        category: '',
        subject: '',
        message: '',
      });

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const categories = userRole === 'customer' 
    ? ['Complaint', 'Suggestion', 'Compliment', 'Product', 'Delivery', 'Other']
    : ['Operations', 'Product', 'Suggestion', 'Complaint', 'Other'];

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Submit Feedback</CardTitle>
          <CardDescription>
            {userRole === 'customer' 
              ? 'Help us improve by sharing your experience'
              : 'Report issues, suggest improvements, or share observations'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Thank you! Your feedback has been submitted successfully.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
                required
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Blanchardstown">Blanchardstown</SelectItem>
                  <SelectItem value="Tallaght">Tallaght</SelectItem>
                  <SelectItem value="Glasnevin">Glasnevin</SelectItem>
                  <SelectItem value="All">All Locations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {userRole === 'customer' && orders.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="order">Related Order (Optional)</Label>
                <Select
                  value={formData.order_id}
                  onValueChange={(value) => setFormData({ ...formData, order_id: value })}
                >
                  <SelectTrigger id="order">
                    <SelectValue placeholder="Select an order (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {orders.map((order) => (
                      <SelectItem key={order.order_id} value={order.order_id}>
                        {order.order_number} - {order.location_name} - €{order.total_amount.toFixed(2)}
                        {' '}({new Date(order.created_at).toLocaleDateString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief summary of your feedback"
                required
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Please provide details..."
                rows={6}
                required
                maxLength={5000}
              />
              <p className="text-sm text-gray-500 text-right">
                {formData.message.length}/5000 characters
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
