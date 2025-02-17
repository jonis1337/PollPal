import { useState, useEffect } from 'react';
import { Poll } from '../types';
import { ThumbsUp, ThumbsDown, CircleX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { serverUrl } from '../config';

interface PollListProps {
    polls: Poll[];
}

export function PollList({ polls }: PollListProps) {
    const { user } = useAuth();
    const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set());
    const [updatedPolls, setUpdatedPolls] = useState<Poll[]>(polls);
    //const { user } = useAuth();
    const calculatePercentage = (yesVotes: number, noVotes: number) => {
        const totalVotes = yesVotes + noVotes;
        return totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0; // Return percentage of "yes" votes
    };

    const getVotes = async (pollId: string) => {
        try {
            const response = await fetch(`${serverUrl}/getvotes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    poll_id: pollId,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                console.error('Failed to get vote');
                return null;
            }
        } catch (error) {
            console.error('Error getting vote:', error);
            return null;
        }
    };

    const handleVote = async (pollId: string, vote: 'yes' | 'no') => {
        try {
            const response = await fetch(`${serverUrl}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    poll_id: pollId,
                    user_id: user?.id,
                    vote,
                }),
            });

            if (response.ok) {
                //set the button to enabled
                setVotedPolls(prev => new Set([...prev, pollId]));
                const updatedVotes = await getVotes(pollId); // Fetch updated vote counts
                if (updatedVotes) {
                    setUpdatedPolls((prevPolls) =>
                        prevPolls.map((poll) =>
                            poll.id === pollId
                                ? { ...poll, votes: updatedVotes }
                                : poll
                        )
                    );

                }



            }

        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    const getUserVotes = async (userID: string) => {
        try {
            const response = await fetch(`${serverUrl}/getuservotes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userID,
                }),
            });
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                console.error('Failed to get vote');
                return null;
            }
        } catch (error) {
            console.error('Error getting vote:', error);
            return null;
        }
    }

    const getVotesForVotedPolls = async () => {
        if (!user) return;

        try {
            const votes = await getUserVotes(user.id);
            if (!votes) return;

            const votedPollIds: Set<string> = new Set(votes.map((vote: any) => vote.poll_id));
            setVotedPolls(votedPollIds);

            // Fetch updated votes for all voted polls
            const updatedVotesArray = await Promise.all(
                Array.from(votedPollIds).map(async (pollId) => {
                    const updatedVotes = await getVotes(pollId);
                    return updatedVotes ? { pollId, votes: updatedVotes } : null;
                })
            );

            // Ensure `votes` structure matches `Poll` type
            setUpdatedPolls((prevPolls) =>
                prevPolls.map((poll) => {
                    const updatedVotesData = updatedVotesArray.find(
                        (voteData) => voteData?.pollId === poll.id
                    );

                    return updatedVotesData
                        ? { ...poll, votes: updatedVotesData.votes }
                        : poll;
                })
            );
        } catch (error) {
            console.error('Error fetching votes for voted polls:', error);
        }
    };

    const handleDeletePoll = async (pollId: string) => {
        try {
            const response = await fetch('/deletepoll', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    poll_id: pollId,
                }),
            });

            if (response.ok) {
                setUpdatedPolls((prevPolls) =>
                    prevPolls.filter((poll) => poll.id !== pollId)
                );
            } else {
                console.error('Failed to delete poll');
            }
        } catch (error) {
            console.error('Error deleting poll:', error);
        }
    }

    useEffect(() => {
        // If the poll data changes, update the UI with the new data
        setUpdatedPolls(polls);
        getVotesForVotedPolls();
    }, [polls]);






    return (
        <div className="">
            {updatedPolls.map((poll) => {
                //add the number of votes to the poll
                const totalVotes: number = Number(poll.votes.yes) + Number(poll.votes.no);
                const yesPercentage = calculatePercentage(Number(poll.votes.yes), Number(poll.votes.no));
                const noPercentage = 100 - yesPercentage;
                return (

                    <div key={poll.id} className="poll-card">
                        <div className="delete-box">
                            {poll.createdBy === user?.username ? (
                                <div className="deletePollButton">
                                    <button onClick={() => handleDeletePoll(poll.id)}><CircleX /></button>
                                </div>
                            ) : (
                                <div></div>
                            )}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{poll.question}</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Created by {poll.createdBy} on {new Date(poll.createdAt).toLocaleDateString()}
                        </p>

                        {totalVotes > 0 && (
                            <div className="progress-bar-box">
                                <div
                                    className="progress-bar-yes"
                                    style={{ width: `${yesPercentage}%` }}
                                >
                                    {yesPercentage.toFixed(1)}%
                                </div>
                                <div
                                    className="progress-bar-no"
                                    style={{ width: `${noPercentage}%` }}
                                >
                                    {noPercentage.toFixed(1)}%
                                </div>
                            </div>
                        )}


                        <div className="votebuttons">
                            <button onClick={() => handleVote(poll.id, 'yes')}
                                disabled={votedPolls.has(poll.id)}>

                                <ThumbsUp />
                                {totalVotes > 0 && (
                                    <span>{poll.votes.yes}</span>
                                )}
                            </button>
                            <button
                                onClick={() => handleVote(poll.id, 'no')}
                                disabled={votedPolls.has(poll.id)}
                            >
                                <ThumbsDown />
                                {totalVotes > 0 && (
                                    <span>{poll.votes.no}</span>
                                )}
                            </button>
                        </div>
                    </div>
                );
            }
            )}
        </div>
    );
}