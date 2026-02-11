export function SiteFooter() {
  return (
    <footer className="border-t bg-white py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Meamasque. All rights reserved.</p>
      </div>
    </footer>
  );
}
