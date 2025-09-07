import { randomUUID } from 'crypto';
import classes from './RequestHeaders.module.css';

export type HeaderItem = {
  id: string;
  enabled: boolean;
  key: string;
  value: string;
};

// TODO: keep headers in context/Redux state
const HEADERS: HeaderItem[] = [
  {
    id: randomUUID(),
    enabled: true,
    key: 'Accept',
    value: '*/*',
  },
  {
    id: randomUUID(),
    enabled: false,
    key: 'Connection',
    value: 'keep-alive',
  },
];

export default function RequestHeaders() {
  return (
    <>
      <h3>HTTP headers</h3>
      <table>
        <tbody>
          {HEADERS.map((header) => (
            <tr key={header.id}>
              <td>
                <input type='checkbox' checked={header.enabled} className={classes.checkbox} />
              </td>
              <td>
                <input type='text' value={header.key} />
              </td>
              <td>
                <input type='text' value={header.value} />
              </td>
              <td>
                <button type='button' className={classes.button}>
                  <svg
                    width='20px'
                    height='20px'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <g clip-path='url(#clip0_429_11083)'>
                      <path
                        d='M7 7.00006L17 17.0001M7 17.0001L17 7.00006'
                        stroke='currentColor'
                        stroke-width='2.5'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                      />
                    </g>
                    <defs>
                      <clipPath id='clip0_429_11083'>
                        <rect width='24' height='24' fill='white' />
                      </clipPath>
                    </defs>
                  </svg>
                </button>
              </td>
            </tr>
          ))}
          <tr>
            <td>
              <button type='button' className={classes.button}>
                <svg
                  width='20px'
                  height='20px'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M6 12H18M12 6V18'
                    stroke='currentColor'
                    stroke-width='2'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                  />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
