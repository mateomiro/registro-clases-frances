export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Registro de Clases de Francés
          </h1>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
} 
