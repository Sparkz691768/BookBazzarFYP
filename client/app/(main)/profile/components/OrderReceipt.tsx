interface OrderItem {
  orderItemId: string
  bookId: string
  bookTitle: string
  bookPrice: number
  quantity: number
  totalPrice: number
}

interface Order {
  orderId: string
  totalAmount: number
  checkedOutTime: string
  orderStatus: number // 0: Pending, 1: Completed, 2: Cancelled, 3: Refunded
  orderItems: OrderItem[]
}

interface OrderReceiptProps {
  order: Order
  id?: string
}

export function OrderReceipt({ order, id }: OrderReceiptProps) {
  const getOrderStatus = (status: number): string => {
    switch (status) {
      case 0:
        return "Pending"
      case 1:
        return "Completed"
      case 2:
        return "Cancelled"
      case 3:
        return "Refunded"
      default:
        return "Pending"
    }
  }

  const getStatusColor = (status: number): string => {
    switch (status) {
      case 0:
        return "#f59e0b" // Amber for pending
      case 1:
        return "#10b981" // blue for completed
      case 2:
        return "#ef4444" // Red for cancelled
      case 3:
        return "#3b82f6" // Blue for refunded
      default:
        return "#f59e0b"
    }
  }

  const formatDateString = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTimeString = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Generate a random transaction ID if not provided
  const transactionId = Math.random().toString(36).substring(2, 10).toUpperCase()

  return (
    <div id={id} className="receipt-container">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@300;400;500;600;700&display=swap');
        
        .receipt-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          background-color: #ffffff;
          color: #333;
          font-family: 'Poppins', sans-serif;
          position: relative;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
          border-radius: 12px;
          overflow: hidden;
        }
        
        .receipt-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 8px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
        }
        
        .receipt-container::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23f3f4f6' fillOpacity='0.4' fillRule='evenodd'/%3E%3C/svg%3E");
          opacity: 0.05;
          z-index: -1;
        }
        
        .receipt-header {
          position: relative;
          padding-bottom: 30px;
          margin-bottom: 30px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .receipt-header::after {
          content: "";
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100px;
          height: 3px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
        }
        
        .receipt-title {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          color: #1f2937;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
        }
        
        .receipt-subtitle {
          font-size: 16px;
          color: #6b7280;
          font-weight: 300;
          margin: 0;
        }
        
        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }
        
        .logo-icon {
          color: white;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px;
          margin-bottom: 40px;
        }
        
        .info-section {
          background-color: #f9fafb;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .info-title {
          font-size: 18px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 16px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .info-title svg {
          color: #6366f1;
        }
        
        .info-content {
          display: grid;
          gap: 12px;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }
        
        .info-label {
          color: #6b7280;
          font-weight: 500;
        }
        
        .info-value {
          color: #1f2937;
          font-weight: 600;
        }
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .items-section {
          margin-bottom: 40px;
        }
        
        .items-title {
          font-size: 18px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 16px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .items-title svg {
          color: #6366f1;
        }
        
        .items-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .items-table th {
          background-color: #f3f4f6;
          color: #4b5563;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.5px;
          padding: 16px;
          text-align: left;
        }
        
        .items-table td {
          padding: 16px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #1f2937;
        }
        
        .items-table tr:nth-child(even) td {
          background-color: #f9fafb;
        }
        
        .items-table tr:hover td {
          background-color: #f3f4f6;
        }
        
        .item-name {
          font-weight: 500;
        }
        
        .item-price {
          font-weight: 600;
          color: #6366f1;
        }
        
        .summary-section {
          margin-left: auto;
          width: 300px;
          background-color: #f9fafb;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          font-size: 14px;
        }
        
        .summary-row:not(:last-child) {
          border-bottom: 1px solid #e5e7eb;
        }
        
        .summary-label {
          color: #6b7280;
          font-weight: 500;
        }
        
        .summary-value {
          color: #1f2937;
          font-weight: 600;
        }
        
        .summary-total {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 2px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          font-size: 18px;
        }
        
        .summary-total-label {
          color: #374151;
          font-weight: 600;
        }
        
        .summary-total-value {
          color: #6366f1;
          font-weight: 700;
        }
        
        .receipt-footer {
          margin-top: 60px;
          padding-top: 30px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        
        .footer-message {
          font-weight: 500;
          margin-bottom: 8px;
          color: #374151;
        }
        
        .footer-contact {
          margin-bottom: 16px;
        }
        
        .footer-contact a {
          color: #6366f1;
          text-decoration: none;
          font-weight: 500;
        }
        
        .footer-legal {
          font-size: 12px;
          color: #9ca3af;
        }
        
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 120px;
          font-weight: 700;
          color: rgba(243, 244, 246, 0.7);
          text-transform: uppercase;
          letter-spacing: 10px;
          pointer-events: none;
          z-index: -1;
          white-space: nowrap;
        }
        
        @media print {
          .receipt-container {
            box-shadow: none;
            padding: 20px;
          }
          
          body {
            background: white;
          }
        }
      `}</style>

      {/* Watermark */}
      <div className="watermark">Receipt</div>

      {/* Header */}
      <div className="receipt-header flex justify-between items-center">
        <div>
          <h1 className="receipt-title">Order Receipt</h1>
          <p className="receipt-subtitle">Thank you for your purchase!</p>
        </div>
        <div className="logo-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="logo-icon"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
        </div>
      </div>

      {/* Info Grid */}
      <div className="info-grid">
        <div className="info-section">
          <h2 className="info-title">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
              <path d="M12 11h4" />
              <path d="M12 16h4" />
              <path d="M8 11h.01" />
              <path d="M8 16h.01" />
            </svg>
            Order Information
          </h2>
          <div className="info-content">
            <div className="info-row">
              <span className="info-label">Order ID:</span>
              <span className="info-value">#{order.orderId.slice(0, 8)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Date:</span>
              <span className="info-value">{formatDateString(order.checkedOutTime)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Time:</span>
              <span className="info-value">{formatTimeString(order.checkedOutTime)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Status:</span>
              <span
                className="status-badge"
                style={{
                  backgroundColor: `${getStatusColor(order.orderStatus)}15`,
                  color: getStatusColor(order.orderStatus),
                }}
              >
                {getOrderStatus(order.orderStatus)}
              </span>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h2 className="info-title">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
            Payment Information
          </h2>
          <div className="info-content">
            <div className="info-row">
              <span className="info-label">Payment Method:</span>
              <span className="info-value">Credit Card</span>
            </div>
            <div className="info-row">
              <span className="info-label">Transaction ID:</span>
              <span className="info-value">{transactionId}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Total Amount:</span>
              <span className="info-value" style={{ color: "#6366f1" }}>
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="items-section">
        <h2 className="items-title">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
          </svg>
          Order Items
        </h2>
        <table className="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.orderItems.map((item, index) => (
              <tr key={item.orderItemId || index}>
                <td className="item-name">{item.bookTitle}</td>
                <td>${item.bookPrice.toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td className="item-price">${item.totalPrice.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Summary */}
      <div className="summary-section">
        <div className="summary-row">
          <span className="summary-label">Subtotal</span>
          <span className="summary-value">${order.totalAmount.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Tax</span>
          <span className="summary-value">$0.00</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Shipping</span>
          <span className="summary-value">$0.00</span>
        </div>
        <div className="summary-total">
          <span className="summary-total-label">Total</span>
          <span className="summary-total-value">${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="receipt-footer">
        <p className="footer-message">Thank you for shopping with us!</p>
        <p className="footer-contact">
          If you have any questions, please contact our customer support at{" "}
          <a href="mailto:support@bookstore.com">support@bookstore.com</a>
        </p>
        <div className="footer-legal">
          <p>© {new Date().getFullYear()} BookStore. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
