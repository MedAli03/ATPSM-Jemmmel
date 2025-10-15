import { Text, View } from 'react-native';
import { format } from 'date-fns';

export default function MessageItem({ message }) {
  const date = message?.created_at ? format(new Date(message.created_at), 'yyyy-MM-dd HH:mm') : '';
  const isMine = message?.isMine;
  return (
    <View className={`mb-3 ${isMine ? 'items-start' : 'items-end'}`}>
      <View className={`max-w-[80%] rounded-2xl px-4 py-3 ${isMine ? 'bg-blue-600' : 'bg-gray-200'}`}>
        <Text className={`text-base ${isMine ? 'text-white' : 'text-gray-900'}`}>{message?.content}</Text>
      </View>
      {date ? <Text className="mt-1 text-xs text-gray-500">{date}</Text> : null}
    </View>
  );
}
