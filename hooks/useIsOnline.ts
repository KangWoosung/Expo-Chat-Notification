import * as Network from "expo-network";
import { useEffect, useState } from "react";

export default function useIsOnline() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkNetwork = async () => {
      const status = await Network.getNetworkStateAsync();
      setIsOnline(
        status?.isConnected === true && status?.isInternetReachable === true
      );
    };

    checkNetwork();

    // 네트워크 상태 변화 감지 리스너
    const subscription = Network.addNetworkStateListener((status) => {
      setIsOnline(
        status.isConnected === true && status.isInternetReachable === true
      );
    });

    return () => {
      subscription && subscription.remove();
    };
  }, []);

  return isOnline;
}
