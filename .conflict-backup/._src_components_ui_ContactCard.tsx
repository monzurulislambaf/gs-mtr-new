import { memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
<<<<<<< HEAD
import { Text, IconButton, useTheme } from 'react-native-paper';
import { Contact } from '@/types/contact';
import { ContactAvatar } from './ContactAvatar';
import { makePhoneCall } from '@/utils/permissions';
import { formatPhone } from '@/utils/formatters';
=======
import { Text, Checkbox, IconButton, useTheme } from 'react-native-paper';
import { Contact } from '@/types/contact';
import { ContactAvatar } from './ContactAvatar';
import { makePhoneCall } from '@/utils/permissions';
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0

interface ContactCardProps {
  contact: Contact;
  isSelected: boolean;
  isSelectionMode: boolean;
  isAdmin?: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onEditPress?: () => void;
  onDeletePress?: () => void;
<<<<<<< HEAD
  onFavoritePress?: (id: string, favorite: boolean) => void;
}

const PHONE_FIELDS: { key: 'SERVICE MOBILE' | 'PERSONAL MOBILE' | 'OFFICE TELEPHONE' | 'PERSONAL TELEPHONE'; icon: string }[] = [
  { key: 'SERVICE MOBILE', icon: 'phone' },
  { key: 'PERSONAL MOBILE', icon: 'cellphone' },
  { key: 'OFFICE TELEPHONE', icon: 'phone-classic' },
  { key: 'PERSONAL TELEPHONE', icon: 'phone-voip' },
];

=======
}

>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
export const ContactCard = memo(function ContactCard({
  contact,
  isSelected,
  isSelectionMode,
  isAdmin,
  onPress,
  onLongPress,
  onEditPress,
  onDeletePress,
<<<<<<< HEAD
  onFavoritePress,
}: ContactCardProps) {
  const theme = useTheme();

  const phones = PHONE_FIELDS
    .map((f) => ({ key: f.key, icon: f.icon, value: contact[f.key] }))
    .filter((f) => f.value);
=======
}: ContactCardProps) {
  const theme = useTheme();

  const hasServiceMobile = !!contact['SERVICE MOBILE'];
  const hasPersonalMobile = !!contact['PERSONAL MOBILE'];
  const hasOffice = !!contact.OFFICE;
  const hasRes = !!contact.RESIDENCE;
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed
            ? theme.colors.surfaceVariant
            : isSelected
<<<<<<< HEAD
            ? theme.colors.primaryContainer + '33'
            : 'transparent',
          borderColor: isSelected ? theme.colors.primary : theme.colors.outlineVariant,
          borderWidth: isSelected ? 1.5 : 1,
=======
              ? theme.colors.primaryContainer
              : 'transparent',
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
        },
      ]}
    >
      <View style={styles.content}>
<<<<<<< HEAD
        <ContactAvatar name={contact.NAME} size={48} />
        <View style={styles.info}>
          <Text variant="titleMedium" numberOfLines={1} style={[styles.name, { fontSize: 17 }]}>
            {contact.RANK ? `${contact.RANK} ` : ''}{contact.NAME}
          </Text>
          {contact.DESIGNATION ? (
            <Text variant="bodySmall" style={[styles.designation, { color: theme.colors.onSurfaceVariant, fontSize: 13 }]} numberOfLines={1}>
              {contact.DESIGNATION}
            </Text>
          ) : null}
          {contact['OFFICE ADDRESS'] ? (
            <Text variant="bodySmall" style={[styles.officeAddress, { fontSize: 12 }]} numberOfLines={1}>
              {contact['OFFICE ADDRESS']}
            </Text>
          ) : null}
          {phones.length > 0 && (
            <View style={styles.phonesContainer}>
              {phones.map((p) => (
                <Pressable
                  key={p.key}
                  style={styles.phoneRow}
                  onPress={() => makePhoneCall(p.value)}
                  hitSlop={{ top: 4, bottom: 4, left: 0, right: 0 }}
                >
                  <IconButton
                    icon={p.icon}
                    size={14}
                    style={styles.phoneIconBtn}
                    // @ts-ignore
                    color={theme.colors.primary}
                  />
                  <Text variant="bodyMedium" numberOfLines={1} style={[styles.phoneValue, { fontSize: 14 }]}>
                    {formatPhone(p.value)}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
        {!isSelectionMode && (
          <View style={styles.actions}>
            {onFavoritePress && (
              <IconButton
                icon={contact.favorite ? 'star' : 'star-outline'}
                size={18}
                // @ts-ignore
                color={contact.favorite ? theme.colors.primary : theme.colors.onSurfaceVariant}
                style={styles.actionBtn}
                onPress={() => onFavoritePress(contact.id, !contact.favorite)}
              />
            )}
            {isAdmin && onEditPress && (
              <IconButton
                icon="pencil"
                size={18}
                // @ts-ignore
                color={theme.colors.onSurfaceVariant}
                style={styles.actionBtn}
                onPress={onEditPress}
              />
            )}
          </View>
        )}
=======
        {isSelectionMode && (
          <Checkbox
            status={isSelected ? 'checked' : 'unchecked'}
            onPress={onPress}
            color={theme.colors.primary}
          />
        )}
        <ContactAvatar name={contact.NAME} size={40} />
        <View style={styles.info}>
          <Text variant="titleMedium" numberOfLines={1} style={styles.name}>
            {contact.RANK ? `${contact.RANK} ` : ''}{contact.NAME}
          </Text>
          {hasServiceMobile && (
            <View style={styles.phoneRow}>
              <Text variant="bodyMedium" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}>
                <Text variant="bodyMedium" style={{ fontWeight: '600' }}>Ser: </Text>
                {contact['SERVICE MOBILE']}
              </Text>
              <IconButton
                icon="phone"
                size={18}
                onPress={() => makePhoneCall(contact['SERVICE MOBILE'])}
                style={styles.phoneIcon}
              />
            </View>
          )}
          {hasPersonalMobile && (
            <View style={styles.phoneRow}>
              <Text variant="bodyMedium" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}>
                <Text variant="bodyMedium" style={{ fontWeight: '600' }}>Per: </Text>
                {contact['PERSONAL MOBILE']}
              </Text>
              <IconButton
                icon="phone"
                size={18}
                onPress={() => makePhoneCall(contact['PERSONAL MOBILE'])}
                style={styles.phoneIcon}
              />
            </View>
          )}
          {(hasOffice || hasRes) && (
            <Text variant="bodyMedium" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>
              {[hasOffice ? `Off: ${contact.OFFICE}` : '', hasRes ? `Res: ${contact.RESIDENCE}` : '']
                .filter(Boolean)
                .join(' | ')}
            </Text>
          )}
        </View>
        {isAdmin && !isSelectionMode ? (
          <View style={styles.actions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={onEditPress}
            />
          </View>
        ) : null}
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
<<<<<<< HEAD
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 12,
    marginVertical: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  name: {
    fontWeight: '600',
    lineHeight: 23,
    flex: 1,
  },
  designation: {
    fontWeight: '500',
    lineHeight: 17,
  },
  officeAddress: {
    color: '#888',
    lineHeight: 15,
    marginTop: 1,
  },
  phonesContainer: {
    marginTop: 4,
    gap: 2,
=======
    paddingVertical: 6,
    borderRadius: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  info: {
    flex: 1,
    gap: 0,
  },
  name: {
    lineHeight: 20,
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
<<<<<<< HEAD
  },
  phoneIconBtn: {
    padding: 0,
    margin: 0,
    width: 22,
    height: 22,
  },
  phoneValue: {
    fontSize: 14,
    lineHeight: 19,
    flex: 1,
=======
    marginVertical: 0,
  },
  phoneIcon: {
    margin: 0,
    padding: 0,
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
<<<<<<< HEAD
    marginLeft: 4,
  },
  actionBtn: {
    padding: 0,
    margin: 0,
  },
});
=======
  },
});
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
