import React, { useEffect, useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';

const StatusUpdate = () => {
	const { statuses, getStatuses, createStatus, markStatusViewed } = useChatStore();
	const { authUser } = useAuthStore();
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		getStatuses();
	}, []);

	if (!statuses) return null;

	return (
		<div className="fixed top-4 right-4 z-40">
			<div className="flex gap-2">
				{statuses.map((s) => (
					<button key={s._id} className="avatar" onClick={async () => { await markStatusViewed(s._id); setIsOpen(true); }}>
						<div className={`size-12 rounded-full border ${s.viewers && s.viewers.some(v => v._id === authUser?._id) ? 'opacity-40' : 'ring-2 ring-primary'}`}>
							<img src={s.image || '/avatar.png'} alt="status" />
						</div>
					</button>
				))}
			</div>

			{isOpen && (
				<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setIsOpen(false)}>
					<div className="bg-white p-4 rounded max-w-md w-full">
						<h3 className="font-semibold mb-2">Statuses</h3>
						<div className="grid gap-2">
							{statuses.map((s) => (
								<div key={s._id} className="flex items-center gap-3">
									<img src={s.image || '/avatar.png'} alt="status" className="w-16 h-16 rounded" />
									<div>
										<div className="font-medium">{s.user?.fullName || 'Unknown'}</div>
										<div className="text-xs text-zinc-500">{s.text}</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default StatusUpdate;
