import { fireEvent, render } from '@testing-library/react-native';

import { EducatorDailyNotesScreen } from '../EducatorDailyNotesScreen';

const mutateAsync = jest.fn();

jest.mock('../../hooks', () => ({
  useDailyNotes: () => ({
    data: [],
    isLoading: false,
    isError: false,
    refetch: jest.fn()
  }),
  useCreateDailyNote: () => ({
    mutateAsync,
    isPending: false
  })
}));

jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({ params: { peiId: 1 } })
}));

describe('EducatorDailyNotesScreen', () => {
  beforeEach(() => {
    mutateAsync.mockClear();
  });

  it('submits a new note', () => {
    const { getByPlaceholderText, getByText } = render(<EducatorDailyNotesScreen />);
    fireEvent.changeText(getByPlaceholderText('أضف ملاحظة'), 'سجل جديد');
    fireEvent.press(getByText('إضافة'));
    expect(mutateAsync).toHaveBeenCalledWith({ content: 'سجل جديد', mood: '' });
  });
});
