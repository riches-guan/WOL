
module.exports = function(RED) {
    "use strict";
    var wol = require('wake_on_lan');
    var chk = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

    function WOLnode(n) {
        RED.nodes.createNode(this,n);
        this.mac = n.mac.trim();
        this.host = n.host;
        this.udpport = n.udpport;
        this.numpackets = n.numpackets;
        this.interval = n.interval;
        var node = this;

        this.on("input", function(msg) {
            var mac = this.mac || msg.mac || null;
            var host = this.host || msg.host || '255.255.255.255';
            var udpport = Number(msg.udpport || this.udpport || '9');
            var numpackets = Number(msg.numpackets || this.numpackets || '3');
            var interval = Number(msg.interval || this.interval || '100');
            if (udpport < 1 || udpport > 65535) {
                node.warn("WOL:UDP端口必须在1和65535之间；它已被重置为9。");
                udpport = 9;
            }
            if (numpackets < 1 || numpackets > 500) {
                node.warn("WOL：数据包的数量必须在1到500之间；它已被重置为3。");
                numpackets = 3;
            }
            if (interval < 1 || interval > 3600000) {
                node.warn("WOL：数据包之间的间隔必须在1到3600000之间；它已被重置为100。");
                interval = 100;
            }
            if (mac != null) {
                if (chk.test(mac)) {
                    try {
                        wol.wake(mac, {address: host, port: udpport, num_packets: numpackets, interval: interval}, function(error) {
                            if (error) {
                                node.warn(error);
                                node.status({fill:"red",shape:"ring",text:" "});
                            }
                            else if (RED.settings.verbose) {
                                node.log("发送WOL魔术包");
                                node.status({fill:"green",shape:"dot",text:" "});
                            }
                        });
                    }
                    catch(e) {
                        if (RED.settings.verbose) { node.log("WOL：套接字错误"); }
                    }
                }
                else { node.warn('WOL：mac地址错误 "'+mac+'"'); }
            }
            else { node.warn("WOL：未指定mac地址"); }
        });

        this.on("close", function () {
            node.status({});
        })
    }
    RED.nodes.registerType("wake on lan",WOLnode);
}
