export function Footer() {
  return (
    <footer className="mt-auto bg-gray-50 dark:bg-gray-900 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-3">RevierKompass</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ein Service der Polizei Baden-Württemberg
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-police-blue">Datenschutz</a></li>
              <li><a href="#" className="hover:text-police-blue">Impressum</a></li>
              <li><a href="#" className="hover:text-police-blue">Barrierefreiheit</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Kontakt</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              support@revierkompass-bw.de
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
