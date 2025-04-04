import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <div className="px-2 py-12 md:px-20 md:py-24">
      <h2 className="text-4xl font-semibold md:text-5xl">
        <span className="text-accent-500">Sorry,</span>
        {' '}
        this page isn&apos;t available.
      </h2>

      <p className="mt-6 md:mt-9 md:text-lg">
        The page you are looking for might have been removed, had its name changed, or is
        temporarily unavailable.
      </p>

      <p className="mt-6 md:mt-9">
        Go back to the
        {' '}
        <Link className="text-accent-500" href="/">
          home page
        </Link>
        .
      </p>
    </div>
  )
}
