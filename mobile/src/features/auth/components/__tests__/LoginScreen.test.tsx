import { fireEvent, render } from '@testing-library/react-native';

import { LoginScreen } from '../LoginScreen';

jest.mock('../../hooks/useLogin', () => ({
  useLogin: () => ({
    form: {
      control: {},
      handleSubmit: jest.fn((cb) => cb),
      formState: { errors: {} },
      register: jest.fn(),
      getValues: jest.fn(),
      setValue: jest.fn(),
      watch: () => ''
    },
    handleSubmit: jest.fn(),
    isLoading: false
  })
}));

describe('LoginScreen', () => {
  it('renders login button', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('تسجيل الدخول')).toBeTruthy();
  });

  it('submits form on button press', () => {
    const handleSubmitMock = jest.fn();
    (require('../../hooks/useLogin') as any).useLogin = () => ({
      form: {
        control: {},
        handleSubmit: (cb: any) => cb,
        formState: { errors: {} },
        register: jest.fn(),
        getValues: jest.fn(),
        setValue: jest.fn(),
        watch: () => ''
      },
      handleSubmit: handleSubmitMock,
      isLoading: false
    });
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('تسجيل الدخول'));
    expect(handleSubmitMock).toHaveBeenCalled();
  });
});
