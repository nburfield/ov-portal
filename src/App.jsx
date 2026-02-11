import { AuthProvider } from './contexts/AuthContext.jsx'
import { BusinessProvider } from './contexts/BusinessContext.jsx'
import { ToastContainer } from 'react-toastify'

function App() {
  return (
    <AuthProvider>
      <BusinessProvider>
        {/* TODO: Add routing and components here */}
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">OneVizn Portal</h1>
            <p className="text-gray-600">Authentication system initialized</p>
          </div>
        </div>
        <ToastContainer position="top-right" autoClose={5000} stacked />
      </BusinessProvider>
    </AuthProvider>
  )
}

export default App
