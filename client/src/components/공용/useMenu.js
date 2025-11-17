// hooks/useMenu.js
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// 네이버 메뉴 API
export function useMenu(placeId) {
  return useQuery(
    ['menu', placeId],
    async () => {
      if (!placeId) return null;
      try {
        const response = await axios.get(`https://place-crawling.onrender.com/menu/menu?business_id=${placeId}`);
        return response.data || [];
      } catch (error) {
        console.error('Menu fetch error:', error);
        return [];
      }
    },
    {
      enabled: !!placeId,
      staleTime: 1000 * 60 * 60 * 12, // 12시간 동안 캐시
      cacheTime: 1000 * 60 * 60 * 24, // 24시간 동안 저장
      retry: 1,
    }
  );
}

// 네이버 메뉴 그룹 API
export function useMenuGroups(placeId) {
  return useQuery(
    ['menuGroups', placeId],
    async () => {
      if (!placeId) return null;
      try {
        const response = await axios.get(`https://place-crawling.onrender.com/menu/menuGroups?business_id=${placeId}`);
        return response.data || [];
      } catch (error) {
        console.error('Menu groups fetch error:', error);
        return [];
      }
    },
    {
      enabled: !!placeId,
      staleTime: 1000 * 60 * 60 * 12,
      cacheTime: 1000 * 60 * 60 * 24,
      retry: 1,
    }
  );
}

// 로컬 restaurant API - 추가된 함수
export function useRestaurant(placeId) {
  return useQuery(
    ['restaurant', placeId],
    async () => {
      if (!placeId) return null;
      try {
        const response = await axios.get(`/api/restaurant/${placeId}`);
        return response.data;
      } catch (error) {
        console.error('Restaurant fetch error:', error);
        return null;
      }
    },
    {
      enabled: !!placeId,
      staleTime: 1000 * 60 * 60 * 6,
      cacheTime: 1000 * 60 * 60 * 12,
    }
  );
}

// 로컬 hours API - 추가된 함수
export function useRestaurantHours(placeId) {
  return useQuery(
    ['restaurantHours', placeId],
    async () => {
      if (!placeId) return [];
      try {
        const response = await axios.get(`/api/restaurant/${placeId}/hours`);
        return response.data || [];
      } catch (error) {
        console.error('Hours fetch error:', error);
        return [];
      }
    },
    {
      enabled: !!placeId,
      staleTime: 1000 * 60 * 60 * 6,
      cacheTime: 1000 * 60 * 60 * 12,
    }
  );
}