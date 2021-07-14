import { useCallback, useEffect, useRef, useState } from 'react';
import { green, lightgrey } from '../../lib/colors';
import {
	addOrUpdateEventSignup,
	getEvent,
	getEventSignups,
	removeEventSignup,
} from '../api';
import { useMe } from '../hooks';
import { IEvent, IEventSignup } from '../types';
import UIButton from '../UI/UIButton';
import UILink from '../UI/UILink';
import UIPlacesAutocomplete from '../UI/UIPlacesAutocomplete';
import UISecondaryBox from '../UI/UISecondaryBox';
import UISecondaryHeader from '../UI/UISecondaryHeader';
import useThrottle from '../useThrottle';
import EventCarpools from './EventCarpools';
import EventContext from './EventContext';
import EventDetails from './EventDetails';
import EventSignups from './EventSignups';

function GroupName({ group }: { group: IEvent['group'] }) {
	return <UILink href={`/groups/${group.id}`}>{group.name}</UILink>;
}

export default function Event({
	id,
	initial,
}: {
	id: number;
	initial?: IEvent;
}) {
	const [event, setEvent] = useState<IEvent | null>(initial || null);
	const [placeId, setPlaceId] = useState<string | null>(null);
	const [interested, setInterested] = useState(false);
	const [updating, setUpdating] = useState(false);
	const [signups, setSignups] = useState<IEventSignup[] | null>(null);
	const toggleInterested = useCallback(() => setInterested((i) => !i), []);
	const toggleInterestedThrottled = useThrottle(toggleInterested, 500);
	const existingSignup = useRef({
		interested: false,
		placeId: null as string | null,
		eventId: null as number | null,
	});
	const me = useMe();

	const refresh = useCallback(() => {
		getEvent(id).then(setEvent);
	}, [id]);

	useEffect(refresh, [refresh]);

	useEffect(() => {
		if (signups === null) {
			return;
		}

		const removeSignup = () => {
			if (prev.interested) {
				removeEventSignup(id)
					.then(() => {
						prev.interested = false;
					})
					.finally(() => setUpdating(false));
			}
		};

		const addOrUpdateSignup = () => {
			if (!prev.interested || prev.placeId !== placeId) {
				console.log('Adding or updating signup.', prev, {
					interested,
					placeId,
					eventId: id,
					signups,
				});
				addOrUpdateEventSignup(id, placeId)
					.then(() => {
						prev.placeId = placeId;
						prev.eventId = id;
						prev.interested = true;
					})
					.finally(() => setUpdating(false));
			}
		};

		const prev = existingSignup.current;

		if (!interested) {
			removeSignup();
		} else {
			addOrUpdateSignup();
		}
	}, [id, interested, placeId, signups, updating]);

	useEffect(() => {
		getEventSignups(id)
			.then((signups) => {
				for (let signup of signups) {
					if (signup.user.id === me?.id) {
						setInterested(true);
						setPlaceId(signup.placeId);
						existingSignup.current.eventId = id;
						existingSignup.current.placeId = signup.placeId;
						existingSignup.current.interested = true;
					}
				}
				setSignups(signups);
			})
			.catch(console.error);
	}, [id, me?.id]);

	if (!event) {
		return <UISecondaryBox>Loading...</UISecondaryBox>;
	}

	const { name, group, formattedAddress, startTime, endTime } = event;

	return (
		<EventContext.Provider value={{ event, refresh, default: false }}>
			<UISecondaryBox>
				<div style={{ textAlign: 'center' }}>
					<UISecondaryHeader>{name}</UISecondaryHeader>
					<GroupName group={group} />
				</div>
				<EventDetails {...{ startTime, endTime, formattedAddress }} />
				<UIButton
					onClick={toggleInterestedThrottled}
					style={{
						backgroundColor: interested ? green : lightgrey,
						color: interested ? 'white' : 'black',
						transition: 'color 0.2s, background-color 0.2s',
					}}
				>
					{interested ? 'Interested' : 'Not interested'}
				</UIButton>
				{interested && (
					<>
						<UIPlacesAutocomplete
							placeholder="Pickup and dropoff location"
							onSelected={(_address, placeID) => {
								setPlaceId(placeID);
							}}
							style={placeId != null ? { border: '2px solid ' + green } : {}}
							placeId={placeId}
						/>
						<br />
						<EventCarpools />
						{signups !== null && (
							<EventSignups
								event={event}
								myPlaceId={placeId}
								signups={signups}
							/>
						)}
					</>
				)}
			</UISecondaryBox>
		</EventContext.Provider>
	);
}
