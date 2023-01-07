<script lang="ts">
	import { onMount } from 'svelte';

	import { type DataConnection, Peer } from 'peerjs';

	import type { RoomPlugin, RoomData } from 'clounge/types';
	import { defaultPlugins, loadPlugins } from 'clounge/plugins';

	const PLUGIN_URLS_KEY = 'pluginUrls';
	const QUERY_PARAM_PEER_ID_KEY = 'peer';

	function noErrorParseJSON(json: string | null) {
		try {
			return JSON.parse(json ?? '');
		} catch {
			console.error('failed to parse plugin-json:', json);
			return null;
		}
	}

	onMount(async () => {
		const params = new URLSearchParams(location.search);
		const peer = params.get(QUERY_PARAM_PEER_ID_KEY);
		const self = new Peer();

		const externalPlugins: string[] =
			noErrorParseJSON(sessionStorage.getItem(PLUGIN_URLS_KEY)) ?? [];

		const plugins: RoomPlugin[] = [...defaultPlugins(), ...(await loadPlugins(externalPlugins))];

		self.on('open', (id) => {
			const room: RoomData = {
				objects: {},
				peers: {},
				self: {
					id,
					connect: (peer) => { 
						const peerCon = self.connect(peer);
						setupPeerDataHandler(peerCon);
					},
				}
			};

			plugins.forEach((plugin) => plugin.selfSetup && plugin.selfSetup(room));

			self.on('connection', (con) => {
				setupPeerDataHandler(con);
			});

			if (peer) room.self.connect(peer);

			function setupPeerDataHandler(con: DataConnection) {
				con.on('open', () => {
					room.peers[con.peer] = { connection: con };
					plugins.forEach((plugin) => plugin.peerSetup && plugin.peerSetup(room, con.peer));
				});

				con.on('data', (data) => {
					plugins.forEach(
						(plugin) => plugin.processData && plugin.processData(room, data, con.peer)
					);
				});
			}
		});
	});
</script>

<style global>
	html {
		overflow: hidden;
	}
</style>