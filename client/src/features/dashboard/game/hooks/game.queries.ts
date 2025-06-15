import { BASE_URL } from "@/features/common/consts";
import { gameService } from "@/features/dashboard/game/services/game.service";
import { GameProps } from "@/features/dashboard/game/types/games.types";
import {
	BuyInProps,
	CashOutProps
} from "@/features/dashboard/game/types/player-details.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export const useGameQuery = (game_id?: string) => {
	return useQuery({
	  queryKey: ["game", game_id],
	  queryFn: () => gameService.getGame(game_id!),
	  enabled: !!game_id,
	  refetchInterval: 1 * 60 * 1000,
	  refetchOnWindowFocus: false,
	  retry: 1,
	});
  };
  

export const useTotalGamesCountQuery = () => {
	return useQuery({
		queryKey: ["total-games-count"],
		queryFn: () => gameService.getTotalNumberOfGames(),
	});
};

export const useFetchGamesQuery = (limit: number, skip: number) => {
	return useQuery<GameProps[], unknown>({
		queryKey: ["games", limit, skip],
		queryFn: () => gameService.getGames(limit, skip),
		staleTime: 5 * 60 * 1000,
	});
};


export const useGameCompletion = () => {
	const queryClient = useQueryClient();

	return useMutation<GameProps, unknown, string>({
	  mutationFn: (gameId) => gameService.completeGame(gameId),
	  onSuccess: (data: GameProps) => {alert("Game Ended Successfully!");
		queryClient.invalidateQueries({ queryKey: ["game", data._id] });

	  },
	  onError: (err) => alert(`Failed Ending Game, Please make sure cashouts match all buyins: ${err}`),
	});
  };

  export const useAddPlayerBuyIn = () => {
	const queryClient = useQueryClient();

	return useMutation<GameProps, unknown, BuyInProps>({
		mutationFn: (params: BuyInProps) => gameService.addPlayerBuyIn(params.gameId, params.buyIn),
		onSuccess: (data: GameProps) => {alert("Buy In Updated Successfully!");
			queryClient.invalidateQueries({ queryKey: ["game", data._id] });
		},
		onError: (err) => alert(`Failed To Updated Buy In, ${err}`),
	});
};

export const usePlayerCashOut = () => {
	const queryClient = useQueryClient();

	return useMutation<GameProps, unknown, CashOutProps>({
		mutationFn: (params: CashOutProps) => gameService.playerCashOut(params.gameId, params.cashOut),
		onSuccess: (data: GameProps) => {alert("Cash Out Updated Successfully!");
			queryClient.invalidateQueries({ queryKey: ["game", data._id] });
		},
		onError: (err) => alert(`Failed To Updated Cash Out, ${err}`),
	});
};
  

export const useGameEvents = (
	gameId: string,
	onGameUpdate: (game: GameProps) => void
) => {
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!gameId) return;

		console.log("Opening SSE connection for game:", gameId);
		const eventSource = new EventSource(`${BASE_URL}/events/games/${gameId}`);

		eventSource.onmessage = (event) => {
			try {
				const updatedGame = JSON.parse(event.data);
				console.log("Received game update:", updatedGame);
				onGameUpdate(updatedGame);
			} catch (err) {
				console.error("Error parsing SSE data:", err);
			}
		};

		eventSource.onerror = (error) => {
			console.error("SSE connection error:", error);
		};

		eventSource.onopen = () => {
			console.log("SSE connection opened");
		};

		return () => {
			console.log("Closing SSE connection for game:", gameId);
			eventSource.close();
		};
	}, [gameId, queryClient, onGameUpdate]);
};

// export const useUpdateGame = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ gameId, data }: { gameId: string; data: unknown }) =>
//       api.putData(`/games/${gameId}`, data),
//     onSuccess: (data) => queryClient.invalidateQueries({ queryKey: ["game"] }),
//   });
// };

// export const useAddPlayer = () => {
//     const queryClient = useQueryClient();

//     return useMutation({
//         mutationFn: ({gameId, playerId}: {gameId: string, playerId: string}) => api.postData(`/games/${gameId}`)
//     })
// }
