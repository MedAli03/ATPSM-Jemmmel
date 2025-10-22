import { render } from '@testing-library/react-native';

import { ParentChildScreen } from '../ParentChildScreen';

jest.mock('../hooks', () => ({
  useParentChild: () => ({
    data: null,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    childName: ''
  })
}));

describe('ParentChildScreen', () => {
  it('shows empty state when no child', () => {
    const { getByText } = render(<ParentChildScreen />);
    expect(getByText('لا توجد بيانات')).toBeTruthy();
  });
});
