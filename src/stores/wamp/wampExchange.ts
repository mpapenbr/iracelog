import autobahn from "autobahn";

var conn = new autobahn.Connection({ url: "ws://localhost:8090/ws", realm: "racelog" });
