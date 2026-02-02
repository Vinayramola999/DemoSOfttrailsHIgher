import React from 'react';

/**
 * TabErrorBoundary - Error boundary component for handling tab content errors
 * Catches JavaScript errors anywhere in the child component tree and displays fallback UI
 */
class TabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Tab Error:', error, errorInfo);
    
    // You can also log the error to an error reporting service here
    // Example: errorReportingService.log({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-red-600 text-lg font-medium mb-2">
            Something went wrong loading this tab
          </div>
          <div className="text-gray-600 text-sm mb-4">
            {this.state.error?.message || 'Unknown error occurred'}
          </div>
          <button 
            onClick={this.handleRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default TabErrorBoundary;