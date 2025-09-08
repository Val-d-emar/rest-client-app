import { ServerResponse } from '@/lib/actions/request';
import Spinner from '@/components/Spinner/Spinner';

type ResponseSectionProps = {
  response: ServerResponse | null;
  loading: boolean;
};

export default function ResponseSection({ response, loading }: ResponseSectionProps) {
  if (loading) {
    return (
      <div className='centered-container'>
        <Spinner />
      </div>
    );
  }

  if (!response) {
    return <div>Send a request to see the response here.</div>;
  }

  if (response.error) {
    return <div className='error'>Error: {response.error}</div>;
  }

  return (
    <div>
      <h3>Response</h3>
      <p>
        <span className='bold'>Status:</span> {response.status}
      </p>
      <h4>Headers:</h4>
      <pre className='response-viewer response-viewer-headers'>
        {JSON.stringify(response.headers, null, 2)}
      </pre>
      <h4>Body:</h4>
      <pre className='response-viewer response-viewer-body'>
        {JSON.stringify(response.body, null, 2)}
      </pre>
    </div>
  );
}
