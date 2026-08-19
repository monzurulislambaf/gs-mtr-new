import { memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { Contact } from '@/types/contact';
import { ContactAvatar } from './ContactAvatar';
import { makePhoneCall } from '@/utils/permissions';
import { formatPhone } from '@/utils/formatters';
import { spacing, radius, typography } from '@/theme';

interface ContactCardProps {
  contact: Contact;
  isSelected: boolean;
  isSelectionMode: boolean;
  isAdmin?: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onEditPress?: () => void;
  onDeletePress?: () => void;
  onFavoritePress?: (id: string, favorite: boolean) => void;
}

const PHONE_FIELDS: { key: 'SERVICE MOBILE' | 'PERSONAL MOBILE' | 'OFFICE TELEPHONE' | 'PERSONAL TELEPHONE'; icon: string }[] = [
  { key: 'SERVICE MOBILE', icon: 'phone' },
  { key: 'PERSONAL MOBILE', icon: 'cellphone' },
  { key: 'OFFICE TELEPHONE', icon: 'phone-classic' },
  { key: 'PERSONAL TELEPHONE', icon: 'phone-voip' },
];

export const ContactCard = memo(function ContactCard({
  contact,
  isSelected,
  isSelectionMode,
  isAdmin,
  onPress,
  onLongPress,
  onEditPress,
  onDeletePress,
  onFavoritePress,
}: ContactCardProps) {
  const theme = useTheme();

  const phones = PHONE_FIELDS
    .map((f) => ({ key: f.key, icon: f.icon, value: contact[f.key] }))
    .filter((f) => f.value);

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
            ? theme.colors.primaryContainer + '33'
            : 'transparent',
          borderColor: isSelected ? theme.colors.primary : theme.colors.outlineVariant,
          borderWidth: isSelected ? 1.5 : 1,
        },
      ]}
    >
      <View style={styles.content}>
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
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xxs,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  info: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  name: {
    ...typography.bodySmall,
    fontWeight: '600',
    flex: 1,
  },
  designation: {
    ...typography.caption,
    fontWeight: '500',
  },
  officeAddress: {
    ...typography.caption,
    lineHeight: 15,
    marginTop: spacing.xxs,
  },
  phonesContainer: {
    marginTop: spacing.xs,
    gap: spacing.xxs,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneIconBtn: {
    padding: 0,
    margin: 0,
    width: 22,
    height: 22,
  },
  phoneValue: {
    ...typography.label,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  actionBtn: {
    padding: 0,
    margin: 0,
  },
});
