/*
 * Created by: Andrew
 * Date created: 10.11.2023
 * Modified by: Andrew
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

// ERROR BOUNDARY FALLBACK COMPONENT
const ErrorBoundaryFallback = () => {
  // Refresh the page
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-[150px] font-bold text-red-500">404</h1>
        <p className="text-2xl text-gray-600  mb-5">
          Sorry, something went wrong.
        </p>
        <p className="text-gray-600 mb-4">
          Please try refreshing the page or come back later.
        </p>
        <button
          onClick={handleRefresh}
          className="text-white bg-blue-500 px-4 py-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default ErrorBoundaryFallback;
