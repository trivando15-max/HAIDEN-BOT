const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const express = require('express');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const PREFIX = '!';
const VOUCH_CHANNEL_ID = '1470667210778214675';
const COMPRAS_FILE = './compras.json';

const EMOJI_VERI = '<a:EMOJIVERI:1574998893689577523>';
const EMOJI_RED = '<a:EMOJIALERTRED:1574998814769680475>';
const EMOJI_ORANGE = '<a:EMOJIALERTORANGE:1574998744510767144>';
const EMOJI_ROBLOX = '<:Roblox:1518984627593805986>';
const GROUPS = [
  { id: 35619576, name: "ANIME UGC'S CREATOR", requiredDays: 15, url: "https://www.roblox.com/groups/35619576" },
  { id: 34564860, name: "Comunidad Celestial RBLX", requiredDays: 15, url: "https://www.roblox.com/groups/34564860" },
  { id: 13080841, name: "Gorra Shop", requiredDays: 15, url: "https://www.roblox.com/groups/13080841" },
  { id: 15119364, name: "ＢＬＡＣＫ ＣＡＴ＄ ＵＧC", requiredDays: 15, url: "https://www.roblox.com/groups/15119364" },
  { id: 33422152, name: "nxtrnd", requiredDays: 15, url: "https://www.roblox.com/groups/33422152" },
  { id: 33332820, name: "Random Island", requiredDays: 15, url: "https://www.roblox.com/groups/33332820" },
  { id: 35816914, name: "One Ugc man", requiredDays: 15, url: "https://www.roblox.com/groups/35816914" },
  { id: 35826008, name: "Really", requiredDays: 15, url: "https://www.roblox.com/groups/35826008" },
  { id: 578297005, name: "Anime ugccs", requiredDays: 15, url: "https://www.roblox.com/groups/578297005" },
  { id: 33707960, name: "SeIfMade Ent", requiredDays: 15, url: "https://www.roblox.com/groups/33707960" },
  { id: 35399081, name: "drowsing", requiredDays: 15, url: "https://www.roblox.com/groups/35399081" },
  { id: 809551446, name: "AnimeFACTORY1", requiredDays: 15, url: "https://www.roblox.com/groups/809551446" },
  { id: 567256399, name: "UGC Bundle Shop", requiredDays: 15, url: "https://www.roblox.com/groups/567256399" },
  { id: 608833450, name: "tactical cool", requiredDays: 15, url: "https://www.roblox.com/groups/608833450" },
];

const PAISES = {
  global:     { nombre: 'Global',     flag: '🌐', moneda: 'USD', normal: 6.5,  descuento: 6 },
  colombia:   { nombre: 'Colombia',   flag: '🇨🇴', moneda: 'COP', normal: 24000, descuento: 22000 },
  mexico:     { nombre: 'México',     flag: '🇲🇽', moneda: 'MXN', normal: 130,   descuento: 119 },
  peru:       { nombre: 'Perú',       flag: '🇵🇪', moneda: 'PEN', normal: 24,    descuento: 22 },
  argentina:  { nombre: 'Argentina',  flag: '🇦🇷', moneda: 'ARS', normal: 12000, descuento: 11000 },
  chile:      { nombre: 'Chile',      flag: '🇨🇱', moneda: 'CLP', normal: 7000,  descuento: 6500 },
  ecuador:    { nombre: 'Ecuador',    flag: '🇪🇨', moneda: 'USD', normal: 7,     descuento: 6.5 },
  europa:     { nombre: 'Europa',     flag: '🇪🇺', moneda: 'EUR', normal: 6.6,   descuento: 6.1 },
  panama:     { nombre: 'Panamá',     flag: '🇵🇦', moneda: 'USD', normal: 7,     descuento: 6.5 },
  eeuu:       { nombre: 'Estados Unidos', flag: '🇺🇸', moneda: 'USD', normal: 6.85, descuento: 6.32 },
  nicaragua:  { nombre: 'Nicaragua',  flag: '🇳🇮', moneda: 'NIO', normal: 270,   descuento: 250 },
  venezuela:  { nombre: 'Venezuela',  flag: '🇻🇪', moneda: 'VES', normal: 8000,  descuento: 7400 },
  usdt:       { nombre: 'USDT',       flag: '💵', moneda: 'USDT', normal: 6.5,  descuento: 6 }
};

const RANGOS = [
  { nombre: 'Buyer', robux: 0 },
  { nombre: '1K Buyer', robux: 1000 },
  { nombre: '5K Buyer', robux: 5000 },
  { nombre: '10K Buyer', robux: 10000 },
  { nombre: '30K Buyer', robux: 30000 },
  { nombre: '50K Buyer', robux: 50000 },
  { nombre: '100K Buyer', robux: 100000 }
];

function loadCompras() {
  if (!fs.existsSync(COMPRAS_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(COMPRAS_FILE, 'utf8')); } catch { return {}; }
}
function saveCompras() { fs.writeFileSync(COMPRAS_FILE, JSON.stringify(compradores, null, 2)); }
let compradores = loadCompras();

function extractDataFromMessages(messages) {
  const fullText = messages.map(m => m.content).join('\n');
  const getValue = (label) => {
    const regex = new RegExp(`${label}\\s*[:\\-]\\s*(.+)`, 'i');
    const match = fullText.match(regex);
    return match ? match[1].split('\n')[0].trim() : null;
  };
  return {
    cliente: getValue('cliente'),
    discord: getValue('discord') || fullText.match(/<@!?\d+>/)?.[0] || null,
    referencia: getValue('referencia'),
    compra: getValue('compra'),
    precio: getValue('precio'),
    total: getValue('total'),
    rango: getValue('rango')
  };
}

function getRango(robux) {
  let actual = RANGOS[0], siguiente = null;
  for (const r of RANGOS) {
    if (robux >= r.robux) actual = r;
    else { siguiente = r; break; }
  }
  return { actual, siguiente };
}

async function getRobloxUserId(username) {
  try {
    const res = await axios.post('https://users.roblox.com/v1/usernames/users', { usernames: [username], excludeBannedUsers: true });
    return res.data.data[0]?.id || null;
  } catch { return null; }
}

async function getMembership(groupId, userId) {
  try {
    const res = await axios.get(`https://apis.roblox.com/cloud/v2/groups/${groupId}/memberships`, {
      headers: { 'x-api-key': process.env.ROBLOX_API_KEY },
      params: { filter: `user == 'users/${userId}'`, maxPageSize: 10 }
    });
    const m = res.data.groupMemberships?.[0];
    if (!m) return null;
    return { days: Math.floor((Date.now() - new Date(m.createTime)) / 86400000) };
  } catch { return null; }
}

function crearEmbedPrecio(paisKey, cantidad, tipo) {
  const p = PAISES[paisKey];
  if (!p) return null;
  const pn = p.normal, pd = p.descuento;
  let desc;
  if (tipo === 'a_robux') {
    const robuxN = Math.floor((cantidad / pn) * 1000);
    const robuxD = Math.floor((cantidad / pd) * 1000);
    desc = `# ${robuxN.toLocaleString()} Robux\n\n${p.flag} **${p.nombre}**\n💵 **Monto ingresado:** \`${cantidad} ${p.moneda}\`\n📦 **Recibirás:** \`${robuxN.toLocaleString()} Robux\`\n\n🔥 **Con descuento (30k+):** **${robuxD.toLocaleString()} Robux**\n━━━━━━━━━━━━━━━━━━━━\n*Tarifa:* \`${pn} ${p.moneda} / 1.000 Robux\``;
  } else {
    const dineroN = (cantidad / 1000 * pn).toFixed(2);
    const dineroD = (cantidad / 1000 * pd).toFixed(2);
    desc = `# ${dineroN} ${p.moneda}\n\n${p.flag} **${p.nombre}**\n📦 **Robux ingresados:** \`${cantidad.toLocaleString()}\`\n💵 **Costo:** \`${dineroN} ${p.moneda}\`\n\n🔥 **Con descuento (30k+):** **${dineroD} ${p.moneda}**\n━━━━━━━━━━━━━━━━━━━━\n*Tarifa:* \`${pn} ${p.moneda} / 1.000 Robux\``;
  }
  return new EmbedBuilder().setColor(0x00ff88).setAuthor({ name: 'Haiden Store • Calculadora' }).setDescription(desc).setFooter({ text: 'Haiden Store' });
}

client.once('ready', async () => {
  console.log(`Bot listo como ${client.user.tag}`);
  const paisChoices = Object.entries(PAISES).map(([key, p]) => ({ name: `${p.flag} ${p.nombre}`, value: key }));
  const commands = [
    new SlashCommandBuilder().setName('verificar').setDescription('Verifica días en grupos').addStringOption(o => o.setName('usuario').setDescription('Username de Roblox').setRequired(true)),
    new SlashCommandBuilder().setName('vouch').setDescription('Publica un vouch').setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    new SlashCommandBuilder().setName('top').setDescription('Top compradores'),
    new SlashCommandBuilder().setName('perfil').setDescription('Tu perfil de comprador').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(false)),
    new SlashCommandBuilder().setName('precio').setDescription('Calculadora de precios')
      .addStringOption(o => o.setName('tipo').setDescription('Tipo de cálculo').setRequired(true).addChoices({ name: 'Dinero → Robux', value: 'a_robux' }, { name: 'Robux → Dinero', value: 'a_dinero' }))
      .addNumberOption(o => o.setName('cantidad').setDescription('Cantidad').setRequired(true))
      .addStringOption(o => o.setName('pais').setDescription('País').setRequired(true).addChoices(...paisChoices))
  ].map(c => c.toJSON());
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'verificar') {
    await interaction.deferReply();
    const username = interaction.options.getString('usuario');
    const userId = await getRobloxUserId(username);
    if (!userId) return interaction.editReply('❌ Usuario no encontrado.');

    const results = [];
    let eligible = 0, waiting = 0, notIn = 0;
    for (const g of GROUPS) {
      const m = await getMembership(g.id, userId);
      if (!m) { notIn++; results.push({ ...g, status: 'not_in' }); }
      else if (m.days >= g.requiredDays) { eligible++; results.push({ ...g, status: 'eligible', days: m.days }); }
      else { waiting++; results.push({ ...g, status: 'waiting', days: m.days }); }
    }

    let desc = `🌐 **RESUMEN DE VERIFICACIÓN**\n`;
    desc += `${EMOJI_VERI} **${eligible}** elegibles  ${EMOJI_ORANGE} **${waiting}** en espera  ${EMOJI_RED} **${notIn}** sin unirse\n`;
    desc += `**${GROUPS.length}** grupos configurados\n\n`;

    const eligibleGroups = results.filter(r => r.status === 'eligible');
    if (eligibleGroups.length) {
      desc += `${EMOJI_VERI} **GRUPOS ELEGIBLES (${eligibleGroups.length})**\n`;
      desc += eligibleGroups.map(g => `${EMOJI_VERI} ${EMOJI_ROBLOX} **[${g.name}](${g.url})**\n└ Cumple ${g.days}/15 días`).join('\n') + '\n\n';
    }

    const waitingGroups = results.filter(r => r.status === 'waiting');
    if (waitingGroups.length) {
      desc += `${EMOJI_ORANGE} **EN ESPERA (${waitingGroups.length})**\n`;
      desc += waitingGroups.map(g => `${EMOJI_ORANGE} ${EMOJI_ROBLOX} **[${g.name}](${g.url})**\n└ Lleva ${g.days}/15 días`).join('\n') + '\n\n';
    }

    const notInGroups = results.filter(r => r.status === 'not_in');
    if (notInGroups.length) {
      desc += `${EMOJI_RED} **GRUPOS PENDIENTES DE UNIRSE (${notInGroups.length})**\n`;
      desc += notInGroups.map(g => `${EMOJI_RED} ${EMOJI_ROBLOX} **[${g.name}](${g.url})**\n└ No pertenece al grupo`).join('\n');
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`🔍 Verificación de ${username}`)
      .setDescription(desc.slice(0, 4096))
      .setFooter({ text: 'Haiden Store • Roblox Open Cloud' });

    await interaction.editReply({ embeds: [embed] });
  }

  if (interaction.commandName === 'vouch') {
    await interaction.deferReply({ ephemeral: true });
    const msgs = await interaction.channel.messages.fetch({ limit: 25 });
    const auto = extractDataFromMessages([...msgs.values()]);
    const cliente = auto.cliente || 'Cliente';
    const discordUser = auto.discord || 'No especificado';
    const referencia = auto.referencia || interaction.channel.name;
    const compra = auto.compra || 'No especificado';
    const precio = auto.precio || 'No especificado';
    const total = auto.total || compra;
    const rango = auto.rango || 'Buyer';

    const uidMatch = discordUser.match(/\d+/);
    if (uidMatch) {
      const uid = uidMatch[0];
      const robux = parseInt((compra.match(/\d+/) || [0])[0]);
      const dinero = parseFloat((precio.match(/[\d.]+/) || [0])[0]);
      if (!compradores[uid]) compradores[uid] = { robux: 0, dinero: 0, compras: 0 };
      compradores[uid].robux += robux;
      compradores[uid].dinero += dinero;
      compradores[uid].compras += 1;
      saveCompras();
    }

    let thumb = null;
    if (uidMatch) try { thumb = (await client.users.fetch(uidMatch[0])).displayAvatarURL({ size: 256 }); } catch {}

    const ch = client.channels.cache.get(VOUCH_CHANNEL_ID);
    if (!ch) return interaction.editReply('❌ Canal no encontrado');
    const embed = new EmbedBuilder().setTitle('🛒 ¡Nueva compra registrada!').setColor(0x00ff88)
      .setDescription(`# ${cliente}\nha realizado una compra en **Haiden Store**`).setThumbnail(thumb)
      .addFields(
        { name: '👤 Cliente', value: discordUser, inline: true },
        { name: '🔖 Referencia', value: referencia, inline: true },
        { name: '📦 Compra', value: compra, inline: true },
        { name: '💵 Precio', value: precio, inline: true },
        { name: '📊 Total', value: total, inline: true },
        { name: '🏆 Rango', value: rango, inline: true }
      ).setFooter({ text: 'Haiden Store • Autovouch' }).setTimestamp();
    await ch.send({ embeds: [embed] });
    await interaction.editReply('✅ Vouch publicado');
  }

  if (interaction.commandName === 'top') {
    const sorted = Object.entries(compradores).sort((a, b) => b[1].robux - a[1].robux).slice(0, 10);
    if (!sorted.length) return interaction.reply('Todavía no hay datos.');
    const embed = new EmbedBuilder().setTitle('🏆 TOP COMPRADORES').setColor(0xFFD700)
      .setDescription('# Los mejores compradores\n\n' + sorted.map(([id, d], i) => `**#${i+1}** <@${id}>\n📦 **${d.robux.toLocaleString()}** Robux • 💰 $${d.dinero.toFixed(2)}`).join('\n\n'));
    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'perfil') {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const data = compradores[user.id] || { robux: 0, dinero: 0, compras: 0 };
    const { actual, siguiente } = getRango(data.robux);
    const faltan = siguiente ? siguiente.robux - data.robux : 0;
    const embed = new EmbedBuilder().setTitle(`📊 Perfil de ${user.username}`).setColor(0x5865F2).setThumbnail(user.displayAvatarURL())
      .setDescription(`# ${actual.nombre}`)
      .addFields(
        { name: '💎 Robux comprados', value: `**${data.robux.toLocaleString()}**`, inline: true },
        { name: '💰 Dinero gastado', value: `**$${data.dinero.toFixed(2)}**`, inline: true },
        { name: '🛒 Compras', value: `**${data.compras}**`, inline: true },
        { name: '⬆️ Próximo rango', value: siguiente ? `**${siguiente.nombre}**\nFaltan **${faltan.toLocaleString()}** Robux` : '**Rango máximo**' }
      );
    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'precio') {
    const tipo = interaction.options.getString('tipo');
    const cantidad = interaction.options.getNumber('cantidad');
    const pais = interaction.options.getString('pais');
    const embed = crearEmbedPrecio(pais, cantidad, tipo);
    if (!embed) return interaction.reply('❌ País no válido.');
    await interaction.reply({ embeds: [embed] });
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;
  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'help') {
    const embed = new EmbedBuilder().setTitle('📖 Lista de Comandos').setColor(0x5865F2)
      .setDescription('# Comandos disponibles\n\n**Con `!`:**\n`!verificar usuario`\n`!vouch`\n`!top`\n`!perfil`\n`!precio 10 argentina`\n\n**También funcionan con `/`**');
    await message.reply({ embeds: [embed] });
  }

  if (command === 'precio' || command === 'prices') {
    const cantidad = parseFloat(args[0]);
    const paisInput = args.slice(1).join(' ').toLowerCase();
    if (!cantidad || !paisInput) return message.reply('Usá: `!precio 10 argentina`');
    const paisKey = Object.keys(PAISES).find(k => PAISES[k].nombre.toLowerCase().includes(paisInput) || k.includes(paisInput));
    if (!paisKey) return message.reply('❌ País no encontrado.');
    const tipo = args.includes('robux') ? 'a_dinero' : 'a_robux';
    const embed = crearEmbedPrecio(paisKey, cantidad, tipo);
    await message.reply({ embeds: [embed] });
  }
});

const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot online'));
app.listen(PORT, () => console.log(`Web server on port ${PORT}`));

client.login(process.env.DISCORD_TOKEN);
