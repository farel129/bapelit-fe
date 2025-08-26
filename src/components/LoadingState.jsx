import { Loader } from "lucide-react"

const LoadingState = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-black" />
          <p className="text-gray-600">Memuat detail disposisi...</p>
        </div>
      </div>
  )
}

export default LoadingState