import Error, { type ErrorProps } from 'next/error';

export default function AppError(props: ErrorProps) {
  return <Error {...props} />;
}
