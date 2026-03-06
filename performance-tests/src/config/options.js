export const BASE_URL = __ENV.BASE_URL || 'https://dummyjson.com';

export const executionOptions = {
  stages: [
    { duration: '30s', target: 10  }, // rampa subindo suave
    { duration: '1m',  target: 25  }, // carga moderada
    { duration: '1m',  target: 25  }, // sustentada
    { duration: '30s', target: 0   }, // rampa descendo
  ],

  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],
    http_req_failed: ['rate<0.05'],
    http_reqs: ['rate>10'],
  },
};