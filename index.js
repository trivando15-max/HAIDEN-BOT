const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const express = require('express');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

const PREFIX = '!';
const VOUCH_CHANNEL_ID = '1574971863287992350';
const CLOSED_TICKETS_LOG_CHANNEL = '1575184096882073600';
const COMPRAS_FILE = './compras.json';

const sesiones = new Map();

const ROLES_COMPRADORES = [
  { id: '1477849576160493609', min: 2000 },
  { id: '1477849302452666419', min: 500 },
  { id: '1477848925183676487', min: 101 },
  { id: '1477848696614817905', min: 0 }
];

const EMOJI_VERI = '<a:EMOJIVERI:1574998893689577523>';
const EMOJI_RED = '<a:EMOJIALERTRED:1574998814769680475>';
const EMOJI_ORANGE = '<a:EMOJIALERTORANGE:1574998744510767144>';
const EMOJI_ROBLOX = '<:Roblox:1518984627593805986>';
const EMOJI_ROBUX = '<:robux:1476751095991632017>';
const EMOJI_STAR = '<:star:1477863237252022493>';
const EMOJI_FELIZ = '<a:feliz:1502438386286329886>';
const EMOJI_MONEY = '💸';
const EMOJI_BAGS = '🛍️';
const EMOJI_FIRE = '<a:bluefire:1472319351335030998>';

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
  global:     { nombre: 'Global',     flag: '🌐', moneda: 'USDT', fiat: null, datos: 'Binance ID / Crypto' },
  colombia:   { nombre: 'Colombia',   flag: '🇨🇴', moneda: 'COP',  fiat: 'COP', datos: 'Nequi / Bancolombia' },
  mexico:     { nombre: 'México',     flag: '🇲🇽', moneda: 'MXN',  fiat: 'MXN', datos: 'Transferencia / Oxxo' },
  peru:       { nombre: 'Perú',       flag: '🇵🇪', moneda: 'PEN',  fiat: 'PEN', datos: 'Yape / Plin / BCP' },
  argentina:  { nombre: 'Argentina',  flag: '🇦🇷', moneda: 'ARS',  fiat: 'ARS', datos: 'Mercado Pago / Transferencia' },
  chile:      { nombre: 'Chile',      flag: '🇨🇱', moneda: 'CLP',  fiat: 'CLP', datos: 'Banco Estado / Santander' },
  ecuador:    { nombre: 'Ecuador',    flag: '🇪🇨', moneda: 'USD',  fiat: null, datos: 'Banco Pichincha' },
  uruguay:    { nombre: 'Uruguay',    flag: '🇺🇾', moneda: 'UYU',  fiat: null, datos: 'Prex' },
  europa:     { nombre: 'Europa',     flag: '🇪🇺', moneda: 'EUR',  fiat: null, datos: 'Bizum / Transferencia' },
  panama:     { nombre: 'Panamá',     flag: '🇵🇦', moneda: 'USD',  fiat: null, datos: 'Yappy' },
  eeuu:       { nombre: 'Estados Unidos', flag: '🇺🇸', moneda: 'USD', fiat: null, datos: 'Zelle / CashApp' },
  nicaragua:  { nombre: 'Nicaragua',  flag: '🇳🇮', moneda: 'NIO',  fiat: null, datos: 'Banco LAFISE' },
  venezuela:  { nombre: 'Venezuela',  flag: '🇻🇪', moneda: 'VES',  fiat: 'VES', datos: 'Pago Móvil' },
  usdt:       { nombre: 'USDT',       flag: '💵', moneda: 'USDT', fiat: null, datos: 'Binance / Crypto' }
};

const METODOS_ROBUX = {
  grupo:   { nombre: 'Grupo',   normal: 6.5, descuento: 6 },
  gamepass:{ nombre: 'Gamepass', precio: 7 },
  plus:    { nombre: 'Plus',     precio: 8 },
  regalo:  { nombre: 'Regalo',   precio: 5.5 }
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

async function asignarRolComprador(guild, userId, totalDinero) {
  try {
    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) return;
    const rolCorrespondiente = ROLES_COMPRADORES.find(r => totalDinero >= r.min);
    if (!rolCorrespondiente) return;
    for (const rol of ROLES_COMPRADORES) {
      if (member.roles.cache.has(rol.id) && rol.id !== rolCorrespondiente.id) {
        await member.roles.remove(rol.id).catch(() => {});
      }
    }
    if (!member.roles.cache.has(rolCorrespondiente.id)) {
      await member.roles.add(rolCorrespondiente.id);
    }
  } catch (e) {}
}

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
    rango: getValue('rango'),
    via: getValue('via') || getValue('robux via')
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

async function getRobloxAvatar(userId) {
  try {
    const res = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
    return res.data.data[0]?.imageUrl || null;
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

async function getBinanceP2PPrice(fiat) {
  try {
    const res = await axios.get('https://www.binance.com/bapi/c2c/v1/public/c2c/agent/quote-price', {
      params: { fiat, asset: 'USDT', tradeType: 'BUY' },
      timeout: 8000
    });
    const price = parseFloat(res.data?.data?.price || 0);
    if (!price) return null;
    return price * 1.016;
  } catch (e) { return null; }
}

function getPrecioRobuxUSDT(metodo, cantidad) {
  const m = METODOS_ROBUX[metodo];
  if (!m) return null;
  if (metodo === 'grupo') return cantidad >= 30000 ? m.descuento : m.normal;
  return m.precio;
}

async function calcularPrecio(paisKey, cantidad, metodo) {
  const pais = PAISES[paisKey];
  if (!pais) return null;
  const precioBase = getPrecioRobuxUSDT(metodo, cantidad);
  if (!precioBase) return null;
  let totalUSDT = (cantidad / 1000) * precioBase;
  if (pais.moneda === 'USD') totalUSDT *= 1.05;
  else if (pais.moneda !== 'EUR' && pais.moneda !== 'USDT') totalUSDT *= 1.02;

  let precioLocal = totalUSDT;
  let moneda = 'USDT';
  if (pais.fiat) {
    const tasa = await getBinanceP2PPrice(pais.fiat);
    if (tasa) { precioLocal = totalUSDT * tasa; moneda = pais.moneda; }
  } else if (pais.moneda === 'EUR') {
    precioLocal = totalUSDT * 0.93;
    moneda = 'EUR';
  }
  return { precioLocal, moneda, precioUSDT: totalUSDT };
}

function crearBotonesPaises() {
  const rows = [];
  let row = new ActionRowBuilder();
  let count = 0;
  for (const [key, p] of Object.entries(PAISES)) {
    if (count === 5) { rows.push(row); row = new ActionRowBuilder(); count = 0; }
    row.addComponents(new ButtonBuilder().setCustomId(`pais_${key}`).setLabel(p.nombre).setEmoji(p.flag).setStyle(ButtonStyle.Secondary));
    count++;
  }
  if (count > 0) rows.push(row);
  return rows;
}

function crearBotonesMetodo() {
  return [new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('metodo_grupo').setLabel('Grupo').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('metodo_gamepass').setLabel('Gamepass').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('metodo_plus').setLabel('Plus').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('metodo_regalo').setLabel('Regalo').setStyle(ButtonStyle.Primary)
  )];
}

async function finalizarCompra(channel, userId, sesion) {
  const precio = await calcularPrecio(sesion.pais, sesion.cantidad, sesion.metodo);
  const pais = PAISES[sesion.pais];
  const metodo = METODOS_ROBUX[sesion.metodo];

  const resumen = 
    `**📋 RESUMEN DE COMPRA**\n` +
    `Cliente: <@${userId}>\n` +
    `Usuario Roblox: ${sesion.usuario || 'No especificado'}\n` +
    `Compra: ${sesion.cantidad} Robux\n` +
    `Via: ${metodo.nombre}\n` +
    (sesion.juego ? `Juego: ${sesion.juego}\n` : '') +
    `País: ${pais.nombre}\n` +
    `Precio: ${precio ? precio.precioLocal.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' ' + precio.moneda : 'No calculado'}\n` +
    `Total: ${sesion.cantidad} Robux\n` +
    `Referencia: ${channel.name}`;

  const embed = new EmbedBuilder()
    .setColor(0x00ff88)
    .setAuthor({ name: '✵•.¸,✵°✵.｡.✰ ℍ𝕒𝕚𝕕𝕖𝕟 𝕊𝕥𝕠𝕣𝕖 🌙 ✰.｡.✵°✵,¸.•✵´' })
    .setTitle(`${EMOJI_FELIZ} Pedido listo para pagar`)
    .setDescription(
      `# Esperamos tu comprobante ${EMOJI_FIRE}\n\n` +
      `**Datos de pago:**\n${pais.datos}\n\n` +
      `**Monto a transferir:**\n# \`${precio ? precio.precioLocal.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '---'} ${precio?.moneda || ''}\`\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      resumen
    )
    .setFooter({ text: 'ʜᴀɪᴅᴇɴ ꜱᴛᴏʀᴇ 🌙' });

  await channel.send({ embeds: [embed] });
  sesiones.delete(userId);
}

client.once('ready', async () => {
  console.log(`Bot listo como ${client.user.tag}`);
  const paisChoices = Object.entries(PAISES).map(([key, p]) => ({ name: `${p.flag} ${p.nombre}`, value: key }));
  const metodoChoices = Object.entries(METODOS_ROBUX).map(([key, m]) => ({ name: m.nombre, value: key }));

  const commands = [
    new SlashCommandBuilder().setName('verificar').setDescription('Verifica días en grupos').addStringOption(o => o.setName('usuario').setDescription('Username de Roblox').setRequired(true)),
    new SlashCommandBuilder().setName('vouch').setDescription('Publica un vouch').setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    new SlashCommandBuilder().setName('top').setDescription('Top compradores'),
    new SlashCommandBuilder().setName('perfil').setDescription('Tu perfil de comprador').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(false)),
    new SlashCommandBuilder().setName('precio').setDescription('Calculadora de precios')
      .addStringOption(o => o.setName('tipo').setDescription('Tipo de cálculo').setRequired(true).addChoices({ name: 'Robux → Dinero', value: 'robux_a_dinero' }, { name: 'Dinero → Robux', value: 'dinero_a_robux' }))
      .addStringOption(o => o.setName('metodo').setDescription('Método de envío').setRequired(true).addChoices(...metodoChoices))
      .addNumberOption(o => o.setName('cantidad').setDescription('Cantidad').setRequired(true))
      .addStringOption(o => o.setName('pais').setDescription('País').setRequired(true).addChoices(...paisChoices))
  ].map(c => c.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
});

client.on('messageCreate', async (message) => {
  if (message.channel.id !== CLOSED_TICKETS_LOG_CHANNEL || !message.author.bot) return;
  if (!message.embeds.length) return;

  const embed = message.embeds[0];
  console.log('Embed en transcripts-close:', embed.title);
  if (!embed.title || !embed.title.toLowerCase().includes('ticket closed')) return;

  console.log('Ticket cerrado detectado');

  let userId = null;
  const authorField = embed.fields?.find(f => f.name === 'Ticket Author');
  if (authorField) {
    const match = authorField.value.match(/<@!?(\d+)>/);
    if (match) userId = match[1];
  }
  if (!userId) {
    console.log('No se encontró Ticket Author');
    return;
  }

  console.log('Usuario:', userId);
  const ticketName = embed.fields?.find(f => f.name === 'Ticket Name')?.value || 'ticket';

  if (!compradores[userId]) compradores[userId] = { robux: 0, dinero: 0, compras: 0 };
  compradores[userId].compras += 1;
  saveCompras();

  const vouchChannel = client.channels.cache.get(VOUCH_CHANNEL_ID);
  if (vouchChannel) {
    const vouchEmbed = new EmbedBuilder()
      .setColor(0x00ff88)
      .setAuthor({ name: '✵•.¸,✵°✵.｡.✰ ℍ𝕒𝕚𝕕𝕖𝕟 𝕊𝕥𝕠𝕣𝕖 🌙 ✰.｡.✵°✵,¸.•✵´' })
      .setTitle('🛒 Nueva compra registrada')
      .setDescription(`# <@${userId}>\nha realizado una compra en **Haiden Store**`)
      .addFields(
        { name: '👤 Cliente', value: `<@${userId}>`, inline: true },
        { name: '🔖 Referencia', value: ticketName, inline: true }
      )
      .setFooter({ text: 'ʜᴀɪᴅᴇɴ ꜱᴛᴏʀᴇ 🌙' });
    await vouchChannel.send({ embeds: [vouchEmbed] });
  }

  try {
    const user = await client.users.fetch(userId);
    await user.send({ content: `Tu ticket **${ticketName}** ha sido cerrado. Gracias por tu compra.` });
  } catch (e) {
    console.log('No se pudo enviar DM:', e.message);
  }
});

client.on('interactionCreate', async interaction => {
  if (interaction.isButton()) {
    const sesion = sesiones.get(interaction.user.id);
    if (!sesion) return interaction.reply({ content: 'Usá `!pagocon` primero.', ephemeral: true });

    if (interaction.customId.startsWith('pais_')) {
      const pais = interaction.customId.replace('pais_', '');
      sesion.pais = pais;
      sesion.paso = 'metodo';
      await interaction.update({
        content: `${EMOJI_VERI} País seleccionado: **${PAISES[pais].nombre}**\n\nAhora elegí el método de envío:`,
        components: crearBotonesMetodo(),
        embeds: []
      });
    }

    if (interaction.customId.startsWith('metodo_')) {
      const metodo = interaction.customId.replace('metodo_', '');
      sesion.metodo = metodo;
      sesion.paso = 'cantidad';
      await interaction.update({
        content: `${EMOJI_VERI} Método: **${METODOS_ROBUX[metodo].nombre}**\n\nEscribí la cantidad de Robux:\n\`!cantidad 1000\``,
        components: []
      });
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'verificar') {
    await interaction.deferReply();
    const username = interaction.options.getString('usuario');
    const userId = await getRobloxUserId(username);
    if (!userId) return interaction.editReply('❌ Usuario no encontrado.');

    const avatar = await getRobloxAvatar(userId);
    const results = [];
    let eligible = 0, waiting = 0, notIn = 0;
    for (const g of GROUPS) {
      const m = await getMembership(g.id, userId);
      if (!m) { notIn++; results.push({ ...g, status: 'not_in' }); }
      else if (m.days >= g.requiredDays) { eligible++; results.push({ ...g, status: 'eligible', days: m.days }); }
      else { waiting++; results.push({ ...g, status: 'waiting', days: m.days }); }
    }

    let desc = `# ${EMOJI_FELIZ} **Verificación de ${username}**\n\n`;
    desc += `🌐 **RESUMEN DE VERIFICACIÓN**\n`;
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
      desc += `${EMOJI_RED} **GRUPOS PENDIENTES (${notInGroups.length})**\n`;
      desc += notInGroups.map(g => `${EMOJI_RED} ${EMOJI_ROBLOX} **[${g.name}](${g.url})**\n└ No pertenece al grupo`).join('\n');
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setAuthor({ name: '✵•.¸,✵°✵.｡.✰ ℍ𝕒𝕚𝕕𝕖𝕟 𝕊𝕥𝕠𝕣𝕖 🌙 ✰.｡.✵°✵,¸.•✵´' })
      .setDescription(desc.slice(0, 4096))
      .setThumbnail(avatar)
      .setFooter({ text: 'ʜᴀɪᴅᴇɴ ꜱᴛᴏʀᴇ 🌙' });
    await interaction.editReply({ embeds: [embed] });
  }

  if (interaction.commandName === 'vouch') {
    await interaction.deferReply({ ephemeral: true });
    const msgs = await interaction.channel.messages.fetch({ limit: 25 });
    const auto = extractDataFromMessages([...msgs.values()]);
    const discordUser = auto.discord || 'No especificado';
    const uidMatch = discordUser.match(/\d+/);
    if (uidMatch) {
      const uid = uidMatch[0];
      const robux = parseInt((auto.compra?.match(/\d+/) || [0])[0]);
      const dinero = parseFloat((auto.precio?.match(/[\d.]+/) || [0])[0]);
      if (!compradores[uid]) compradores[uid] = { robux: 0, dinero: 0, compras: 0 };
      compradores[uid].robux += robux;
      compradores[uid].dinero += dinero;
      compradores[uid].compras += 1;
      saveCompras();
      await asignarRolComprador(interaction.guild, uid, compradores[uid].dinero);
    }
    const ch = client.channels.cache.get(VOUCH_CHANNEL_ID);
    if (ch) {
      const embed = new EmbedBuilder()
        .setColor(0x00ff88)
        .setAuthor({ name: '✵•.¸,✵°✵.｡.✰ ℍ𝕒𝕚𝕕𝕖𝕟 𝕊𝕥𝕠𝕣𝕖 🌙 ✰.｡.✵°✵,¸.•✵´' })
        .setDescription(`# ${auto.cliente || 'Cliente'}\nha realizado una compra`)
        .addFields(
          { name: '👤 Cliente', value: discordUser, inline: true },
          { name: '📦 Compra', value: auto.compra || 'No especificado', inline: true },
          { name: '💵 Precio', value: auto.precio || 'No especificado', inline: true },
          { name: '📦 Robux Via', value: auto.via || 'No especificado', inline: true }
        )
        .setFooter({ text: 'ʜᴀɪᴅᴇɴ ꜱᴛᴏʀᴇ 🌙' });
      await ch.send({ embeds: [embed] });
    }
    await interaction.editReply('✅ Vouch publicado');
  }

  if (interaction.commandName === 'top') {
    const sorted = Object.entries(compradores).sort((a, b) => b[1].robux - a[1].robux).slice(0, 10);
    if (!sorted.length) return interaction.reply('No hay datos.');
    let desc = '# 🏆 Top compradores\n\n';
    sorted.forEach(([id, d], i) => { desc += `**#${i + 1}** <@${id}>\n${EMOJI_ROBUX} ${d.robux.toLocaleString()} Robux\n`; });
    const embed = new EmbedBuilder().setColor(0xFFD700).setAuthor({ name: '✵•.¸,✵°✵.｡.✰ ℍ𝕒𝕚𝕕𝕖𝕟 𝕊𝕥𝕠𝕣𝕖 🌙 ✰.｡.✵°✵,¸.•✵´' }).setDescription(desc).setFooter({ text: 'ʜᴀɪᴅᴇɴ ꜱᴛᴏʀᴇ 🌙' });
    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'perfil') {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const data = compradores[user.id] || { robux: 0, dinero: 0, compras: 0 };
    const { actual } = getRango(data.robux);
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setAuthor({ name: '✵•.¸,✵°✵.｡.✰ ℍ𝕒𝕚𝕕𝕖𝕟 𝕊𝕥𝕠𝕣𝕖 🌙 ✰.｡.✵°✵,¸.•✵´' })
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .setDescription(`# ${EMOJI_FELIZ} **Perfil de** ${user.username}\n\n${EMOJI_STAR} **Rango:** ${actual.nombre}\n${EMOJI_ROBUX} **Robux:** ${data.robux.toLocaleString()}\n${EMOJI_MONEY} **Gastado:** $${data.dinero.toFixed(2)}`)
      .setFooter({ text: 'ʜᴀɪᴅᴇɴ ꜱᴛᴏʀᴇ 🌙' });
    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'precio') {
    await interaction.deferReply();
    const metodo = interaction.options.getString('metodo');
    const cantidad = interaction.options.getNumber('cantidad');
    const pais = interaction.options.getString('pais');
    const result = await calcularPrecio(pais, cantidad, metodo);
    if (!result) return interaction.editReply('❌ Error al calcular.');
    const p = PAISES[pais];
    const embed = new EmbedBuilder()
      .setColor(0x00ff88)
      .setAuthor({ name: '✵•.¸,✵°✵.｡.✰ ℍ𝕒𝕚𝕕𝕖𝕟 𝕊𝕥𝕠𝕣𝕖 🌙 ✰.｡.✵°✵,¸.•✵´' })
      .setDescription(`### ${p.flag} ${p.nombre}\n\n${EMOJI_ROBUX} **${cantidad.toLocaleString()} Robux**\n\n💰 **Total:** \`${result.precioLocal.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${result.moneda}\``)
      .setFooter({ text: 'ʜᴀɪᴅᴇɴ ꜱᴛᴏʀᴇ 🌙' });
    await interaction.editReply({ embeds: [embed] });
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;
  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  const userId = message.author.id;

  if (command === 'pagocon') {
    sesiones.set(userId, { paso: 'pais' });
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setAuthor({ name: '✵•.¸,✵°✵.｡.✰ ℍ𝕒𝕚𝕕𝕖𝕟 𝕊𝕥𝕠𝕣𝕖 🌙 ✰.｡.✵°✵,¸.•✵´' })
      .setTitle(`${EMOJI_FELIZ} Selecciona tu país / método de pago`)
      .setDescription('Tocá el botón de tu país para continuar.')
      .setFooter({ text: 'ʜᴀɪᴅᴇɴ ꜱᴛᴏʀᴇ 🌙' });
    await message.reply({ embeds: [embed], components: crearBotonesPaises() });
    return;
  }

  const sesion = sesiones.get(userId);
  if (!sesion) return;

  if (command === 'cantidad' && sesion.paso === 'cantidad') {
    const cant = parseInt(args[0]);
    if (!cant || cant < 1) return message.reply(`${EMOJI_RED} Escribí una cantidad válida. Ejemplo: \`!cantidad 1000\``);
    sesion.cantidad = cant;
    if (sesion.metodo === 'regalo') {
      sesion.paso = 'juego';
      await message.reply(`${EMOJI_VERI} Cantidad guardada.\n\nAhora escribí el nombre del juego:\n\`!juego Adopt Me\``);
    } else {
      sesion.paso = 'usuario';
      await message.reply(`${EMOJI_VERI} Cantidad guardada.\n\nAhora escribí tu usuario de Roblox:\n\`!usuario tunombre\``);
    }
  }

  if (command === 'juego' && sesion.paso === 'juego') {
    const juego = args.join(' ');
    if (!juego) return message.reply(`${EMOJI_RED} Escribí el nombre del juego. Ejemplo: \`!juego Adopt Me\``);
    sesion.juego = juego;
    sesion.paso = 'usuario';
    await message.reply(`${EMOJI_VERI} Juego guardado.\n\nAhora escribí tu usuario de Roblox:\n\`!usuario tunombre\``);
  }

  if (command === 'usuario' && sesion.paso === 'usuario') {
    const usuario = args[0];
    if (!usuario) return message.reply(`${EMOJI_RED} Escribí tu usuario. Ejemplo: \`!usuario nequipepe123\``);
    sesion.usuario = usuario;
    if (sesion.metodo === 'grupo') {
      await message.reply(`${EMOJI_VERI} Usuario: **${usuario}**\n\nPodés verificar más usuarios con \`/verificar usuario\`\nCuando termines, escribí:\n\`!precio automatico\``);
      sesion.paso = 'confirmar';
    } else {
      await finalizarCompra(message.channel, userId, sesion);
    }
  }

  if (command === 'precio' && args[0] === 'automatico' && sesion.paso === 'confirmar') {
    await finalizarCompra(message.channel, userId, sesion);
  }

  if (command === 'help') {
    await message.reply(`${EMOJI_FELIZ} Usá \`!pagocon\` para iniciar una compra.`);
  }
});

const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot online'));
app.listen(PORT, () => console.log(`Web server on port ${PORT}`));

client.login(process.env.DISCORD_TOKEN);
