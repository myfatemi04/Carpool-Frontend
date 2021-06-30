import { useState } from 'react';
import { green, lightgrey } from './colors';
import latlongdist, { R_miles } from './latlongdist';
import UIButton from './UIButton';
import UIPlacesAutocomplete from './UIPlacesAutocomplete';
import UISecondaryBox from './UISecondaryBox';
import UISecondaryHeader from './UISecondaryHeader';
import usePlace from './usePlace';
import useThrottle from './useThrottle';
import useToggle from './useToggle';

export type IEvent = {
	id: number;
	name: string;
	group: string;
	formattedAddress: string;
	startTime: string;
	endTime: string;
	latitude: number;
	longitude: number;
};

function formatStartAndEndTime(
	startDatetimeString: string,
	endDatetimeString: string
) {
	const startDatetime = new Date(startDatetimeString);
	const endDatetime = new Date(endDatetimeString);

	if (isNaN(startDatetime.valueOf())) {
		console.error('Invalid datetime:', startDatetimeString);
		return '(invalid)';
	}
	if (isNaN(endDatetime.valueOf())) {
		console.error('Invalid datetime:', startDatetimeString);
		return '(invalid)';
	}

	const startDateString = startDatetime.toLocaleDateString();
	const endDateString = endDatetime.toLocaleDateString();

	if (startDateString === endDateString) {
		const startTimeString = startDatetime.toLocaleTimeString();
		const endTimeString = endDatetime.toLocaleTimeString();
		return `${startDateString}, ${startTimeString} - ${endTimeString}`;
	} else {
		return `${startDatetime.toLocaleString()} - ${endDatetime.toLocaleString()}`;
	}
}

function GroupName({ name }: { name: string }) {
	return (
		<span
			style={{
				color: '#303030',
				textAlign: 'center',
			}}
		>
			{name}
		</span>
	);
}

function Details({
	startTime,
	endTime,
	formattedAddress,
}: {
	startTime: string;
	endTime: string;
	formattedAddress: string;
}) {
	return (
		<div
			style={{
				marginTop: '0.5rem',
				textAlign: 'left',
			}}
		>
			<span
				style={{
					color: '#303030',
				}}
			>
				<b>When: </b>
				{formatStartAndEndTime(startTime, endTime)}
			</span>
			<br />
			<br />
			<span
				style={{
					color: '#303030',
				}}
			>
				<b>Where: </b>
				{formattedAddress}
			</span>
		</div>
	);
}

export type ICarpool = {
	driver: {
		id: number;
		name: string;
	};
	startTime: string;
	endTime: string;
	extraDistance: number;
};

function CarpoolRow({ carpool }: { carpool: ICarpool }) {
	const PADDING = '1rem';
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				position: 'relative',
				padding: PADDING,
				borderRadius: '0.5rem',
				border: '1px solid #e0e0e0',
				marginTop: '0.5rem',
				marginBottom: '0.5rem',
			}}
		>
			<div>
				<span style={{ fontWeight: 500 }}>{carpool.driver.name}</span>
				<br />
				Time:{' '}
				<b>
					{carpool.startTime} - {carpool.endTime}
				</b>
				<br />
				Offset from route: <b>{carpool.extraDistance} miles</b>
			</div>
			<div
				style={{
					borderRadius: '0.5em',
					cursor: 'pointer',
					padding: '0.5em',
					position: 'absolute',
					right: PADDING,
					userSelect: 'none',
					backgroundColor: '#e0e0e0',
				}}
			>
				Request to join
			</div>
		</div>
	);
}

const dummyCarpoolData: ICarpool[] = [
	{
		driver: {
			id: 0,
			name: 'Michael Fatemi',
		},
		startTime: '10:00',
		endTime: '10:10',
		extraDistance: 6.9,
	},
	{
		driver: {
			id: 1,
			name: 'Joshua Hsueh',
		},
		startTime: '10:05',
		endTime: '10:10',
		extraDistance: 420,
	},
];
function Carpools({ event }: { event: IEvent }) {
	// eslint-disable-next-line
	const [carpools, _setCarpools] = useState(dummyCarpoolData);

	return (
		<div style={{ display: 'flex', flexDirection: 'column' }}>
			<h3 style={{ marginBlockEnd: '0' }}>Carpools</h3>
			{carpools.map((carpool) => (
				<CarpoolRow carpool={carpool} key={carpool.driver.id} />
			))}
		</div>
	);
}

export type IPerson = {
	id: number;
	name: string;
	latitude: number;
	longitude: number;
};

const dummyPeopleData: IPerson[] = [
	{
		id: 0,
		name: 'Rushil Umaretiya',
		latitude: 11.1,
		longitude: 10.09,
	},
	{
		id: 1,
		name: 'Nitin Kanchinadam',
		latitude: 11.09,
		longitude: 10.12,
	},
];
function People({ event, placeId }: { event: IEvent; placeId: string }) {
	const PADDING = '1rem';
	// eslint-disable-next-line
	const [people, setPeople] = useState(dummyPeopleData);
	const placeDetails = usePlace(placeId);
	const locationLongitude = event.latitude;
	const locationLatitude = event.longitude;

	return (
		<div style={{ display: 'flex', flexDirection: 'column' }}>
			<h3 style={{ marginBlockEnd: '0' }}>People</h3>
			{people.map(({ name, latitude, longitude, id }) => {
				let extraDistance = null;
				if (placeDetails != null) {
					const myLatitude = placeDetails.latitude;
					const myLongitude = placeDetails.longitude;
					const meToThem = latlongdist(
						latitude,
						longitude,
						locationLongitude,
						locationLatitude,
						R_miles
					);
					const themToLocation = latlongdist(
						latitude,
						longitude,
						myLatitude,
						myLongitude,
						R_miles
					);
					const totalWithThem = meToThem + themToLocation;
					const totalWithoutThem = latlongdist(
						locationLongitude,
						locationLatitude,
						myLatitude,
						myLongitude,
						R_miles
					);
					extraDistance = totalWithThem - totalWithoutThem;
				}

				return (
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							position: 'relative',
							padding: '1rem',
							borderRadius: '0.5rem',
							border: '1px solid #e0e0e0',
							marginTop: '0.5rem',
							marginBottom: '0.5rem',
						}}
					>
						<b>{name}</b>
						{extraDistance ? `: +${extraDistance.toFixed(1)} miles` : ''}
						<div
							style={{
								borderRadius: '0.5em',
								cursor: 'pointer',
								padding: '0.5em',
								position: 'absolute',
								right: PADDING,
								userSelect: 'none',
								backgroundColor: '#e0e0e0',
							}}
						>
							Invite to carpool
						</div>
					</div>
				);
			})}
		</div>
	);
}

export default function Event({ event }: { event: IEvent }) {
	const { name, group, formattedAddress, startTime, endTime } = event;
	const [haveRide, toggleHaveRide] = useToggle(false);
	const [placeId, setPlaceId] = useState<string>(null!);
	const [interested, toggleInterested] = useToggle(false);
	const toggleInterestedThrottled = useThrottle(toggleInterested, 500);

	return (
		<UISecondaryBox>
			<UISecondaryHeader>{name}</UISecondaryHeader>
			<GroupName name={group} />
			<Details {...{ startTime, endTime, formattedAddress }} />
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
					/>
					{false && (
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								cursor: 'pointer',
								userSelect: 'none',
							}}
							onClick={toggleHaveRide}
						>
							<input
								type="checkbox"
								style={{
									borderRadius: '0.5em',
									width: '2em',
									height: '2em',
									margin: '1em',
								}}
								checked={haveRide}
							/>
							I don't have any way to get there yet
						</div>
					)}
					<Carpools event={event} />
					<People event={event} placeId={placeId} />
				</>
			)}
		</UISecondaryBox>
	);
}
