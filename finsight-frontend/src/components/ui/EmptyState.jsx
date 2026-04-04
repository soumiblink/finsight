export default function EmptyState({ icon = '📭', title, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-3">{icon}</span>
      <p className="text-gray-700 font-medium">{title}</p>
      {message && <p className="text-gray-400 text-sm mt-1">{message}</p>}
    </div>
  )
}
