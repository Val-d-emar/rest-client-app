import { ServerResponse } from '@/lib/actions/request';
import Spinner from '@/components/Spinner/Spinner';
import BodyPane from '../RequestBody/BodyPane';
import ResponseHeaders from './ResponseHeaders';
import { useTranslations } from 'next-intl';

type ResponseSectionProps = {
  response: ServerResponse | null;
  loading: boolean;
};

export default function ResponseSection({ response, loading }: ResponseSectionProps) {
  const t = useTranslations('ClientPage.response');
  if (loading) {
    return (
      <div className='centered-container'>
        <Spinner />
      </div>
    );
  }

  if (!response) {
    return <div>{t('responsePlaceholder')}</div>;
  }

  if (response.error) {
    return (
      <div className='error'>
        {t('error')}: {response.error}
      </div>
    );
  }

  return (
    <div>
      <h3>{t('title')}</h3>
      <h4>{t('responseBody')}:</h4>
      <BodyPane
        body={JSON.stringify(response.body, null, 2)}
        readonly={true}
        status={response.status || undefined}
        statusText={response.statusText || undefined}
      />
      <h4>{t('responseHeaders')}:</h4>
      <ResponseHeaders headers={response.headers} />
    </div>
  );
}
